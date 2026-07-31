import "server-only";

import { randomBytes, randomUUID } from "node:crypto";

import type { CheckoutRequest } from "@/lib/schemas/checkout";
import type {
  CheckoutResult,
  MercadoPagoPayment,
  OrderStatusDto,
  PaymentStatus,
  ProductDto,
} from "@/types/commerce";

import { conceptualProducts, demoShippingZones } from "./catalog-data";
import { AppError } from "./errors";
import { sha256 } from "./security";

interface DemoOrder {
  id: string;
  tokenHash: string;
  status: OrderStatusDto["status"];
  paymentStatus: PaymentStatus;
  subtotalClp: number;
  shippingClp: number;
  totalClp: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  lines: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitPriceClp: number;
  }>;
}

const demoOrders = new Map<string, DemoOrder>();
const webhookEvents = new Set<string>();
const reservedStock = new Map<string, number>();

export function listDemoProducts(input: {
  cursor?: string;
  limit: number;
  collection?: string;
  featured?: boolean;
}): { products: ProductDto[]; nextCursor: string | null } {
  let products = conceptualProducts.filter(
    (product) =>
      (!input.collection || product.collection?.slug === input.collection) &&
      (input.featured === undefined || product.featured === input.featured),
  );
  if (input.cursor) {
    const index = products.findIndex((product) => product.id === input.cursor);
    products = index < 0 ? [] : products.slice(index + 1);
  }
  const page = products.slice(0, input.limit + 1);
  const hasNext = page.length > input.limit;
  const visible = page.slice(0, input.limit).map(withDemoAvailability);
  return {
    products: visible,
    nextCursor: hasNext ? visible.at(-1)?.id ?? null : null,
  };
}

export function getDemoProduct(slug: string): ProductDto | null {
  const product = conceptualProducts.find((item) => item.slug === slug);
  return product ? withDemoAvailability(product) : null;
}

function withDemoAvailability(product: ProductDto): ProductDto {
  return {
    ...product,
    variants: product.variants.map((variant) => {
      const availableQuantity = Math.max(
        variant.availableQuantity - (reservedStock.get(variant.sku) ?? 0),
        0,
      );
      return {
        ...variant,
        availableQuantity,
        available: availableQuantity > 0,
      };
    }),
  };
}

export function createDemoOrder(input: CheckoutRequest): {
  order: DemoOrder;
  token: string;
} {
  const zone = demoShippingZones.find(
    (candidate) => candidate.code === input.shipping.zoneCode,
  );
  if (!zone) {
    throw new AppError(422, "shipping_zone_unavailable", "Zona no disponible.");
  }

  const variants = new Map(
    conceptualProducts.flatMap((product) =>
      product.variants.map((variant) => [
        variant.sku,
        { variant, product },
      ]),
    ),
  );
  let subtotalClp = 0;
  const lines = input.items.map((item) => {
    const found = variants.get(item.sku);
    if (!found) {
      throw new AppError(409, "product_unavailable", "Producto no disponible.");
    }
    const reserved = reservedStock.get(item.sku) ?? 0;
    if (found.variant.availableQuantity - reserved < item.quantity) {
      throw new AppError(
        409,
        "insufficient_stock",
        `No hay stock suficiente para ${found.product.name}.`,
      );
    }
    subtotalClp += found.product.priceClp * item.quantity;
    return {
      sku: item.sku,
      name: found.product.name,
      quantity: item.quantity,
      unitPriceClp: found.product.priceClp,
    };
  });

  const shippingClp =
    subtotalClp >= zone.freeAboveClp ? 0 : zone.priceClp;
  const now = new Date();
  const token = randomBytes(32).toString("base64url");
  const order: DemoOrder = {
    id: randomUUID(),
    tokenHash: sha256(token),
    status: "PENDING_PAYMENT",
    paymentStatus: "PENDING",
    subtotalClp,
    shippingClp,
    totalClp: subtotalClp + shippingClp,
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(now.getTime() + 30 * 60 * 1_000),
    lines,
  };

  for (const line of lines) {
    reservedStock.set(
      line.sku,
      (reservedStock.get(line.sku) ?? 0) + line.quantity,
    );
  }
  demoOrders.set(order.id, order);
  return { order, token };
}

export function setDemoPreference(orderId: string, preferenceId: string): void {
  // The demo adapter intentionally stores no provider credential or payload.
  void orderId;
  void preferenceId;
}

export function getDemoOrderStatus(
  orderId: string,
  token: string,
): OrderStatusDto | null {
  const order = demoOrders.get(orderId);
  if (!order || order.tokenHash !== sha256(token)) return null;
  return {
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalClp: order.totalClp,
    currency: "CLP",
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function claimDemoWebhook(eventId: string): boolean {
  if (webhookEvents.has(eventId)) return false;
  webhookEvents.add(eventId);
  return true;
}

export function applyDemoPayment(payment: MercadoPagoPayment): void {
  const order = demoOrders.get(payment.externalReference);
  if (!order) throw new AppError(404, "order_not_found", "Pedido no encontrado.");
  if (payment.currency !== "CLP" || payment.amountClp !== order.totalClp) {
    order.status = "REVIEW";
    order.paymentStatus = "REVIEW";
    order.updatedAt = new Date();
    return;
  }
  if (payment.status === "approved" && order.status === "PENDING_PAYMENT") {
    order.status = order.expiresAt > new Date() ? "PAID" : "REVIEW";
    order.paymentStatus = order.status === "PAID" ? "APPROVED" : "REVIEW";
    order.updatedAt = new Date();
  }
}

export function checkoutResultFromDemo(
  order: DemoOrder,
  token: string,
  checkoutUrl: string,
): CheckoutResult {
  return {
    orderId: order.id,
    orderToken: token,
    checkoutUrl,
    expiresAt: order.expiresAt.toISOString(),
    totals: {
      subtotalClp: order.subtotalClp,
      shippingClp: order.shippingClp,
      totalClp: order.totalClp,
      currency: "CLP",
    },
  };
}
