import { checkoutSchema } from "@/lib/schemas/checkout";
import { createCheckout } from "@/lib/server/commerce";
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

export async function POST(request: Request): Promise<Response> {
  try {
    assertTrustedOrigin(request);
    assertRateLimit(request, "checkout", 12, 60_000);
    const input = await parseJsonBody(request, checkoutSchema, 32_768);
    const checkout = await createCheckout(input);
    return jsonResponse({ data: checkout }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
