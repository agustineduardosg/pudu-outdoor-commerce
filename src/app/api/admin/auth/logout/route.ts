import {
  expiredSessionCookie,
  logoutAdmin,
  requireAdmin,
} from "@/lib/server/admin-auth";
import { errorResponse, jsonResponse } from "@/lib/server/http";
import { assertTrustedOrigin } from "@/lib/server/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  try {
    assertTrustedOrigin(request);
    const principal = await requireAdmin(request);
    await logoutAdmin(principal);
    return jsonResponse(
      { data: { loggedOut: true } },
      { headers: { "set-cookie": expiredSessionCookie() } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
