const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizePaymentStatus(rawStatus) {
  if (rawStatus === "approved") return "APPROVED";
  if (rawStatus === "rejected") return "REJECTED";
  if (rawStatus === "refunded") return "REFUNDED";
  if (rawStatus === "cancelled") return "CANCELLED";
  return "PENDING";
}

export function retryDelayMs(attempt, baseMs = 5_000, maxMs = 3_600_000) {
  const exponent = Math.max(0, Math.min(10, attempt - 1));
  return Math.min(maxMs, baseMs * 2 ** exponent);
}

export function parseMercadoPagoPayment(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("invalid_provider_response");
  }

  const id = String(raw.id ?? "");
  const externalReference = String(raw.external_reference ?? "");
  const status = String(raw.status ?? "");
  const currency = String(raw.currency_id ?? "");
  const amount = raw.transaction_amount;

  if (
    !/^[A-Za-z0-9-]{1,80}$/.test(id) ||
    !UUID_PATTERN.test(externalReference) ||
    !/^[a-z_]{2,80}$/.test(status) ||
    currency.length !== 3 ||
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error("invalid_provider_response");
  }

  return {
    id,
    externalReference,
    status,
    amountClp: Math.round(amount),
    currency,
  };
}

export function paidEmailContent(order) {
  const itemLines = order.items.map(
    (item) =>
      `${item.quantity} × ${item.productName} · ${item.size} · ${item.colorName}`,
  );
  const total = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(order.totalClp);

  return {
    subject: `Confirmación de pedido PUDU ${order.id.slice(0, 8).toUpperCase()}`,
    text: [
      `Hola ${order.firstName},`,
      "",
      "Recibimos y verificamos tu pago.",
      `Pedido: ${order.id}`,
      ...itemLines,
      `Total: ${total}`,
      "",
      "Te avisaremos cuando el pedido avance a preparación y despacho.",
      "PUDU",
    ].join("\n"),
  };
}

export function paidEmailIdempotencyKey(orderId) {
  if (!UUID_PATTERN.test(orderId)) throw new Error("invalid_order_id");
  return `order-paid-${orderId}`;
}

export function safeFailureCode(error) {
  if (error instanceof Error && /^[a-z0-9_]{3,80}$/i.test(error.message)) {
    return error.message.toLowerCase();
  }
  return error instanceof Error ? error.name : "unknown_error";
}
