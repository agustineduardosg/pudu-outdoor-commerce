import { requireAdmin } from "@/lib/server/admin-auth";
import { errorResponse, jsonResponse } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  try {
    const principal = await requireAdmin(request);
    return jsonResponse({
      data: {
        id: principal.id,
        email: principal.email,
        role: principal.role,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
