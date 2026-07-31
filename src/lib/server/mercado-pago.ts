import "server-only";

import { randomUUID } from "node:crypto";

import {
  mercadoPagoPaymentSchema,
  mercadoPagoPreferenceSchema,
} from "@/lib/schemas/webhook";
import type { MercadoPagoPayment } from "@/types/commerce";

import { canonicalAppOrigin, demoModeAllowed, mercadoPagoMode } from "./env";
import { AppError, ConfigurationError } from "./errors";

const MERCADO_PAGO_API = "https://api.mercadopago.com";
const REQUEST_TIMEOUT_MS = 8_000;

export interface PaymentPreferenceInput {
  orderId: string;
  orderToken: string;
  email: string;
  expiresAt: Date;
  lines: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitPriceClp: number;
  }>;
  shippingClp: number;
}

async function mercadoPagoRequest(
  path: string,
  init: RequestInit,
): Promise<unknown> {
  mercadoPagoMode();
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new ConfigurationError(
      "MERCADO_PAGO_ACCESS_TOKEN no está configurado.",
    );
  }

  const response = await fetch(`${MERCADO_PAGO_API}${path}`, {
    ...init,
    redirect: "error",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
      ...init.headers,
    },
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new AppError(
      502,
      "payment_provider_error",
      "Mercado Pago no pudo completar la operación.",
    );
  }
  return body;
}

export async function createPaymentPreference(
  input: PaymentPreferenceInput,
): Promise<{ preferenceId: string; checkoutUrl: string }> {
  const appOrigin = canonicalAppOrigin();
  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN && demoModeAllowed()) {
    return {
      preferenceId: `demo-${randomUUID()}`,
      checkoutUrl: `${appOrigin}/pedido/${input.orderId}?token=${encodeURIComponent(input.orderToken)}&sandbox=1`,
    };
  }

  const items = input.lines.map((line) => ({
    id: line.sku,
    title: line.name,
    quantity: line.quantity,
    currency_id: "CLP",
    unit_price: line.unitPriceClp,
  }));
  if (input.shippingClp > 0) {
    items.push({
      id: "PUDU-SHIPPING",
      title: "Despacho",
      quantity: 1,
      currency_id: "CLP",
      unit_price: input.shippingClp,
    });
  }

  const raw = await mercadoPagoRequest("/checkout/preferences", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-idempotency-key": input.orderId,
    },
    body: JSON.stringify({
      external_reference: input.orderId,
      items,
      payer: { email: input.email },
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: input.expiresAt.toISOString(),
      notification_url: `${appOrigin}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${appOrigin}/pedido/${input.orderId}?token=${encodeURIComponent(input.orderToken)}`,
        pending: `${appOrigin}/pedido/${input.orderId}?token=${encodeURIComponent(input.orderToken)}`,
        failure: `${appOrigin}/checkout?payment=failed`,
      },
      auto_return: "approved",
    }),
  });

  const preference = mercadoPagoPreferenceSchema.safeParse(raw);
  if (!preference.success) {
    throw new AppError(
      502,
      "invalid_payment_provider_response",
      "Mercado Pago devolvió una respuesta inválida.",
    );
  }

  return {
    preferenceId: preference.data.id,
    checkoutUrl:
      preference.data.sandbox_init_point ?? preference.data.init_point,
  };
}

export async function fetchMercadoPagoPayment(
  paymentId: string,
): Promise<MercadoPagoPayment> {
  if (!/^[A-Za-z0-9-]{1,80}$/.test(paymentId)) {
    throw new AppError(400, "invalid_payment_id", "Pago inválido.");
  }
  const raw = await mercadoPagoRequest(
    `/v1/payments/${encodeURIComponent(paymentId)}`,
    { method: "GET" },
  );
  const payment = mercadoPagoPaymentSchema.safeParse(raw);
  if (!payment.success) {
    throw new AppError(
      502,
      "invalid_payment_provider_response",
      "Mercado Pago devolvió una respuesta inválida.",
    );
  }

  return {
    id: payment.data.id,
    externalReference: payment.data.external_reference,
    status: payment.data.status,
    amountClp: Math.round(payment.data.transaction_amount),
    currency: payment.data.currency_id,
  };
}
