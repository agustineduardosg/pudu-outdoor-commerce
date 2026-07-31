import "server-only";

import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { canonicalAppOrigin, isProduction } from "./env";
import { AppError, ConfigurationError } from "./errors";

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function equivalentLocalOrigin(left: string, right: string): boolean {
  if (isProduction()) return false;

  const leftUrl = new URL(left);
  const rightUrl = new URL(right);
  const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
  return (
    loopbackHosts.has(leftUrl.hostname) &&
    loopbackHosts.has(rightUrl.hostname) &&
    leftUrl.protocol === rightUrl.protocol &&
    leftUrl.port === rightUrl.port
  );
}

export function assertTrustedOrigin(request: Request): void {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    throw new AppError(403, "cross_site_request", "Origen no permitido.");
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    if (isProduction()) {
      throw new AppError(403, "origin_required", "Origen no permitido.");
    }
    return;
  }

  let normalized: string;
  try {
    normalized = new URL(origin).origin;
  } catch {
    throw new AppError(403, "invalid_origin", "Origen no permitido.");
  }

  const canonicalOrigin = canonicalAppOrigin();
  if (
    !constantTimeEqual(normalized, canonicalOrigin) &&
    !equivalentLocalOrigin(normalized, canonicalOrigin)
  ) {
    throw new AppError(403, "invalid_origin", "Origen no permitido.");
  }
}

function rateLimitKey(request: Request, scope: string): string {
  const address =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return createHash("sha256")
    .update(`${scope}:${address}`)
    .digest("base64url");
}

export function assertRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
): void {
  const now = Date.now();
  const key = rateLimitKey(request, scope);
  const bucket = rateBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (bucket.count >= limit) {
    throw new AppError(
      429,
      "rate_limit_exceeded",
      "Demasiadas solicitudes. Intenta nuevamente más tarde.",
    );
  }
  bucket.count += 1;

  if (rateBuckets.size > 5_000) {
    for (const [candidate, value] of rateBuckets) {
      if (value.resetAt <= now) rateBuckets.delete(candidate);
    }
  }
}

export function verifyMercadoPagoSignature(input: {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string;
}): void {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) {
    throw new ConfigurationError(
      "La firma de webhooks de Mercado Pago no está configurada.",
    );
  }
  if (!input.signatureHeader || !input.requestId) {
    throw new AppError(401, "invalid_webhook_signature", "Firma inválida.");
  }

  const parts = Object.fromEntries(
    input.signatureHeader.split(",").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, value.join("=")];
    }),
  );
  const ts = parts.ts;
  const signature = parts.v1;
  if (!ts || !signature || !/^\d{10,13}$/.test(ts)) {
    throw new AppError(401, "invalid_webhook_signature", "Firma inválida.");
  }

  const timestamp = Number(ts);
  const timestampMs = ts.length === 10 ? timestamp * 1_000 : timestamp;
  if (
    !Number.isFinite(timestampMs) ||
    Math.abs(Date.now() - timestampMs) > 10 * 60 * 1_000
  ) {
    throw new AppError(401, "expired_webhook_signature", "Firma inválida.");
  }

  const manifest = `id:${input.dataId.toLowerCase()};request-id:${input.requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  if (!constantTimeEqual(signature.toLowerCase(), expected)) {
    throw new AppError(401, "invalid_webhook_signature", "Firma inválida.");
  }
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
