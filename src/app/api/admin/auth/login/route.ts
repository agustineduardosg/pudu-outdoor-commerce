import { adminLoginSchema } from "@/lib/schemas/admin";
import {
  loginAdmin,
  sessionCookie,
} from "@/lib/server/admin-auth";
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
    assertRateLimit(request, "admin-login", 8, 15 * 60_000);
    const input = await parseJsonBody(request, adminLoginSchema, 8_192);
    const login = await loginAdmin(input);
    return jsonResponse(
      {
        data: {
          email: login.principal.email,
          role: login.principal.role,
          expiresAt: login.expiresAt.toISOString(),
        },
      },
      {
        headers: {
          "set-cookie": sessionCookie(login.token, login.expiresAt),
        },
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
