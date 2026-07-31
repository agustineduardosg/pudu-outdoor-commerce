import { productSlugSchema } from "@/lib/schemas/product";
import { getProductBySlug } from "@/lib/server/commerce";
import { AppError } from "@/lib/server/errors";
import {
  errorResponse,
  jsonResponse,
} from "@/lib/server/http";
import { assertRateLimit } from "@/lib/server/security";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<Response> {
  try {
    assertRateLimit(request, "product-detail", 240, 60_000);
    const parsed = productSlugSchema.safeParse((await context.params).slug);
    if (!parsed.success) {
      throw new AppError(400, "invalid_slug", "Producto inválido.");
    }
    const product = await getProductBySlug(parsed.data);
    if (!product) {
      throw new AppError(404, "product_not_found", "Producto no encontrado.");
    }
    return jsonResponse({ data: product });
  } catch (error) {
    return errorResponse(error);
  }
}
