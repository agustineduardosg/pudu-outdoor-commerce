import { adminBootstrapSchema } from "@/lib/schemas/admin";
import {
  encryptTotpSecret,
  hashAdminPassword,
  verifyBootstrapToken,
} from "@/lib/server/admin-auth";
import { getDatabase } from "@/lib/server/db";
import { AppError, ConfigurationError } from "@/lib/server/errors";
import {
  errorResponse,
  jsonResponse,
  parseJsonBody,
} from "@/lib/server/http";
import {
  assertRateLimit,
  assertTrustedOrigin,
} from "@/lib/server/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  try {
    assertTrustedOrigin(request);
    assertRateLimit(request, "admin-bootstrap", 3, 60 * 60_000);
    verifyBootstrapToken(request);
    const db = getDatabase();
    if (!db) throw new ConfigurationError("PostgreSQL es obligatorio.");
    if ((await db.adminUser.count()) > 0) {
      throw new AppError(
        409,
        "bootstrap_already_completed",
        "El bootstrap ya fue completado.",
      );
    }
    const input = await parseJsonBody(request, adminBootstrapSchema, 8_192);
    const passwordHash = await hashAdminPassword(input.password);
    const totpSecretEncrypted = encryptTotpSecret(input.totpSecret);
    const owner = await db.$transaction(async (tx) => {
      const created = await tx.adminUser.create({
        data: {
          email: input.email,
          passwordHash,
          role: "OWNER",
          totpEnabled: true,
          totpSecretEncrypted,
        },
        select: { id: true, email: true, role: true },
      });
      await tx.auditLog.create({
        data: {
          adminId: created.id,
          actor: created.email,
          action: "admin.bootstrap",
          targetType: "AdminUser",
          targetId: created.id,
        },
      });
      return created;
    });
    return jsonResponse({ data: owner }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
