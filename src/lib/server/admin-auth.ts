import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import { hash, verify as verifyPassword } from "@node-rs/argon2";
import { verify as verifyTotp } from "otplib";

import type { AdminRole } from "@prisma/client";

import { getDatabase } from "./db";
import { canonicalAppOrigin } from "./env";
import { AppError, ConfigurationError } from "./errors";
import { sha256 } from "./security";

const COOKIE_NAME = "pudu_admin_session";
const SESSION_MS = 8 * 60 * 60 * 1_000;

export interface AdminPrincipal {
  id: string;
  email: string;
  role: AdminRole;
  sessionId: string;
}

function requiredDb() {
  const db = getDatabase();
  if (!db) {
    throw new ConfigurationError(
      "El panel administrativo requiere PostgreSQL.",
    );
  }
  return db;
}

function cookieValue(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === COOKIE_NAME) return decodeURIComponent(value.join("="));
  }
  return null;
}

export async function requireAdmin(
  request: Request,
  roles?: AdminRole[],
): Promise<AdminPrincipal> {
  const token = cookieValue(request);
  if (!token || !/^[A-Za-z0-9_-]{40,100}$/.test(token)) {
    throw new AppError(401, "unauthorized", "Autenticación requerida.");
  }
  const session = await requiredDb().adminSession.findFirst({
    where: {
      tokenHash: sha256(token),
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { admin: true },
  });
  if (!session) {
    throw new AppError(401, "unauthorized", "Autenticación requerida.");
  }
  if (roles && !roles.includes(session.admin.role)) {
    throw new AppError(403, "forbidden", "Permiso insuficiente.");
  }
  return {
    id: session.admin.id,
    email: session.admin.email,
    role: session.admin.role,
    sessionId: session.id,
  };
}

export function sessionCookie(token: string, expiresAt: Date): string {
  const secure = new URL(canonicalAppOrigin()).protocol === "https:";
  return [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Expires=${expiresAt.toUTCString()}`,
    "Priority=High",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

export function expiredSessionCookie(): string {
  const secure = new URL(canonicalAppOrigin()).protocol === "https:";
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

function encryptionKey(): Buffer {
  const encoded = process.env.ADMIN_TOTP_ENCRYPTION_KEY;
  if (!encoded) {
    throw new ConfigurationError("Falta ADMIN_TOTP_ENCRYPTION_KEY.");
  }
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new ConfigurationError(
      "ADMIN_TOTP_ENCRYPTION_KEY debe contener 32 bytes en base64.",
    );
  }
  return key;
}

export function encryptTotpSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  return [
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

function decryptTotpSecret(value: string): string {
  const [ivValue, tagValue, encryptedValue] = value.split(".");
  if (!ivValue || !tagValue || !encryptedValue) {
    throw new ConfigurationError("Secreto TOTP almacenado inválido.");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivValue, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export async function hashAdminPassword(password: string): Promise<string> {
  return hash(password, {
    algorithm: 2,
    memoryCost: 19_456,
    timeCost: 3,
    parallelism: 1,
  });
}

export async function loginAdmin(input: {
  email: string;
  password: string;
  totp?: string;
}): Promise<{ principal: AdminPrincipal; token: string; expiresAt: Date }> {
  const db = requiredDb();
  const admin = await db.adminUser.findUnique({ where: { email: input.email } });
  const invalid = () =>
    new AppError(401, "invalid_credentials", "Credenciales inválidas.");
  if (!admin || (admin.lockedUntil && admin.lockedUntil > new Date())) {
    throw invalid();
  }

  const passwordOk = await verifyPassword(admin.passwordHash, input.password);
  let totpOk = !admin.totpEnabled;
  if (admin.totpEnabled && admin.totpSecretEncrypted && input.totp) {
    const result = await verifyTotp({
      secret: decryptTotpSecret(admin.totpSecretEncrypted),
      token: input.totp,
      epochTolerance: 30,
    });
    totpOk = result.valid;
  }
  if (admin.role === "OWNER" && !admin.totpEnabled) totpOk = false;

  if (!passwordOk || !totpOk) {
    const attempts = admin.failedLoginAttempts + 1;
    await db.adminUser.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: attempts >= 5 ? 0 : attempts,
        lockedUntil:
          attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1_000) : null,
      },
    });
    throw invalid();
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MS);
  const session = await db.$transaction(async (tx) => {
    await tx.adminUser.update({
      where: { id: admin.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
    const created = await tx.adminSession.create({
      data: {
        adminId: admin.id,
        tokenHash: sha256(token),
        expiresAt,
      },
    });
    await tx.auditLog.create({
      data: {
        adminId: admin.id,
        actor: admin.email,
        action: "admin.login",
        targetType: "AdminSession",
        targetId: created.id,
      },
    });
    return created;
  });
  return {
    principal: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      sessionId: session.id,
    },
    token,
    expiresAt,
  };
}

export async function logoutAdmin(principal: AdminPrincipal): Promise<void> {
  const db = requiredDb();
  await db.$transaction([
    db.adminSession.update({
      where: { id: principal.sessionId },
      data: { revokedAt: new Date() },
    }),
    db.auditLog.create({
      data: {
        adminId: principal.id,
        actor: principal.email,
        action: "admin.logout",
        targetType: "AdminSession",
        targetId: principal.sessionId,
      },
    }),
  ]);
}

export async function auditAdminMutation(
  principal: AdminPrincipal,
  action: string,
  targetType: string,
  targetId?: string,
): Promise<void> {
  await requiredDb().auditLog.create({
    data: {
      adminId: principal.id,
      actor: principal.email,
      action,
      targetType,
      targetId,
    },
  });
}

export function verifyBootstrapToken(request: Request): void {
  const configured = process.env.ADMIN_BOOTSTRAP_TOKEN;
  const authorization = request.headers.get("authorization") ?? "";
  const provided = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  const providedHash = Buffer.from(sha256(provided));
  const configuredHash = Buffer.from(sha256(configured ?? ""));
  if (
    !configured ||
    configured.length < 32 ||
    providedHash.length !== configuredHash.length ||
    !timingSafeEqual(providedHash, configuredHash)
  ) {
    throw new AppError(401, "unauthorized", "Autenticación requerida.");
  }
}
