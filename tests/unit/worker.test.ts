import { describe, expect, it } from "vitest";

import {
  normalizePaymentStatus,
  paidEmailContent,
  paidEmailIdempotencyKey,
  parseMercadoPagoPayment,
  retryDelayMs,
  safeFailureCode,
} from "../../scripts/worker-lib.mjs";

describe("worker de pagos", () => {
  it("normaliza únicamente estados conocidos", () => {
    expect(normalizePaymentStatus("approved")).toBe("APPROVED");
    expect(normalizePaymentStatus("rejected")).toBe("REJECTED");
    expect(normalizePaymentStatus("refunded")).toBe("REFUNDED");
    expect(normalizePaymentStatus("cancelled")).toBe("CANCELLED");
    expect(normalizePaymentStatus("in_process")).toBe("PENDING");
  });

  it("valida y redondea la respuesta de Mercado Pago", () => {
    expect(
      parseMercadoPagoPayment({
        id: 12345,
        status: "approved",
        external_reference: "1a3a7ce8-bf02-4e6c-a38f-e035ad8efc71",
        transaction_amount: 49990.2,
        currency_id: "CLP",
      }),
    ).toEqual({
      id: "12345",
      status: "approved",
      externalReference: "1a3a7ce8-bf02-4e6c-a38f-e035ad8efc71",
      amountClp: 49990,
      currency: "CLP",
    });
  });

  it("rechaza respuestas incompletas del proveedor", () => {
    expect(() =>
      parseMercadoPagoPayment({
        id: 12345,
        status: "approved",
        transaction_amount: 49990,
        currency_id: "CLP",
      }),
    ).toThrow("invalid_provider_response");
  });

  it("mantiene una clave idempotente estable por pedido", () => {
    const orderId = "1a3a7ce8-bf02-4e6c-a38f-e035ad8efc71";
    expect(paidEmailIdempotencyKey(orderId)).toBe(
      "order-paid-1a3a7ce8-bf02-4e6c-a38f-e035ad8efc71",
    );
    expect(paidEmailIdempotencyKey(orderId)).toBe(
      paidEmailIdempotencyKey(orderId),
    );
  });

  it("aplica backoff exponencial con tope", () => {
    expect(retryDelayMs(1)).toBe(5_000);
    expect(retryDelayMs(4)).toBe(40_000);
    expect(retryDelayMs(20)).toBe(3_600_000);
  });

  it("construye el correo sin alterar datos ni exponerlos en errores", () => {
    const content = paidEmailContent({
      id: "1a3a7ce8-bf02-4e6c-a38f-e035ad8efc71",
      firstName: "Ana",
      totalClp: 49990,
      items: [
        {
          quantity: 1,
          productName: "Shell Ventisquero",
          size: "M",
          colorName: "Bosque",
        },
      ],
    });
    expect(content.subject).toContain("1A3A7CE8");
    expect(content.text).toContain("Shell Ventisquero");
    expect(safeFailureCode(new Error("provider_timeout"))).toBe(
      "provider_timeout",
    );
    expect(safeFailureCode(new Error("ana@example.com no respondió"))).toBe(
      "Error",
    );
  });
});
