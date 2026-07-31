import { mercadoPagoWebhookSchema } from "@/lib/schemas/webhook";
import { enqueueMercadoPagoWebhook } from "@/lib/server/commerce";
import { AppError } from "@/lib/server/errors";
import {
  errorResponse,
  jsonResponse,
} from "@/lib/server/http";
import {
  assertRateLimit,
  sha256,
  verifyMercadoPagoSignature,
} from "@/lib/server/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_WEBHOOK_BYTES = 65_536;

export async function POST(request: Request): Promise<Response> {
  try {
    assertRateLimit(request, "mercado-pago-webhook", 180, 60_000);
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      throw new AppError(
        415,
        "unsupported_media_type",
        "Contenido no soportado.",
      );
    }
    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (
      Number.isFinite(declaredLength) &&
      declaredLength > MAX_WEBHOOK_BYTES
    ) {
      throw new AppError(413, "payload_too_large", "Contenido no soportado.");
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_WEBHOOK_BYTES) {
      throw new AppError(413, "payload_too_large", "Contenido no soportado.");
    }
    let rawPayload: unknown;
    try {
      rawPayload = JSON.parse(rawBody);
    } catch {
      throw new AppError(400, "invalid_json", "Notificación inválida.");
    }
    const payload = mercadoPagoWebhookSchema.safeParse(rawPayload);
    if (!payload.success) {
      throw new AppError(400, "invalid_webhook", "Notificación inválida.");
    }

    const url = new URL(request.url);
    const signedDataId =
      url.searchParams.get("data.id") ?? url.searchParams.get("data_id");
    if (!signedDataId || signedDataId !== payload.data.data.id) {
      throw new AppError(401, "invalid_webhook_signature", "Firma inválida.");
    }
    verifyMercadoPagoSignature({
      signatureHeader: request.headers.get("x-signature"),
      requestId: request.headers.get("x-request-id"),
      dataId: signedDataId,
    });
    if (payload.data.live_mode) {
      throw new AppError(
        403,
        "live_payment_rejected",
        "Esta versión solo acepta eventos sandbox.",
      );
    }
    if (payload.data.type !== "payment") {
      return jsonResponse({ received: true, ignored: true }, { status: 202 });
    }

    const result = await enqueueMercadoPagoWebhook({
      eventId: `${payload.data.type}:${payload.data.id}`,
      requestId: request.headers.get("x-request-id"),
      eventType: payload.data.action,
      paymentId: payload.data.data.id,
      payloadHash: sha256(rawBody),
    });
    return jsonResponse({ received: true, result }, { status: 202 });
  } catch (error) {
    return errorResponse(error);
  }
}
