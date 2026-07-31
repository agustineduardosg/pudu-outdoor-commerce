import { z } from "zod";

import { uuidSchema } from "@/lib/schemas/common";
import { getOrderStatus } from "@/lib/server/commerce";
import { AppError } from "@/lib/server/errors";
import {
  errorResponse,
  jsonResponse,
} from "@/lib/server/http";
import { assertRateLimit } from "@/lib/server/security";

export const dynamic = "force-dynamic";

const tokenSchema = z
  .string()
  .min(40)
  .max(100)
  .regex(/^[A-Za-z0-9_-]+$/);

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    assertRateLimit(request, "order-status", 60, 60_000);
    const id = uuidSchema.safeParse((await context.params).id);
    const token = tokenSchema.safeParse(
      new URL(request.url).searchParams.get("token"),
    );
    if (!id.success || !token.success) {
      throw new AppError(404, "order_not_found", "Pedido no encontrado.");
    }
    const order = await getOrderStatus(id.data, token.data);
    if (!order) {
      throw new AppError(404, "order_not_found", "Pedido no encontrado.");
    }
    return jsonResponse({ data: order });
  } catch (error) {
    return errorResponse(error);
  }
}
