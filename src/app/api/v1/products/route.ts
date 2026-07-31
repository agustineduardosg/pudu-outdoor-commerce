import { productListQuerySchema } from "@/lib/schemas/product";
import { listProducts } from "@/lib/server/commerce";
import { AppError } from "@/lib/server/errors";
import {
  errorResponse,
  jsonResponse,
} from "@/lib/server/http";
import { assertRateLimit } from "@/lib/server/security";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  try {
    assertRateLimit(request, "products-list", 180, 60_000);
    const url = new URL(request.url);
    const parsed = productListQuerySchema.safeParse(
      Object.fromEntries(url.searchParams.entries()),
    );
    if (!parsed.success) {
      throw new AppError(400, "invalid_query", "Parámetros inválidos.");
    }
    const result = await listProducts(parsed.data);
    return jsonResponse({
      data: result.products,
      pagination: { nextCursor: result.nextCursor },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
