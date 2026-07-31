import "server-only";

import { randomBytes, randomUUID } from "node:crypto";

import type { Prisma, PrismaClient } from "@prisma/client";

import type { CheckoutRequest } from "@/lib/schemas/checkout";
import type {
  CheckoutResult,
  MercadoPagoPayment,
  OrderStatusDto,
  PaymentStatus,
  ProductDto,
} from "@/types/commerce";

import {
  applyDemoPayment,
  checkoutResultFromDemo,
  claimDemoWebhook,
  createDemoOrder,
  getDemoOrderStatus,
  getDemoProduct,
  listDemoProducts,
  setDemoPreference,
} from "./demo-store";
import { getDatabase } from "./db";
import { AppError } from "./errors";
import {
  createPaymentPreference,
  fetchMercadoPagoPayment,
} from "./mercado-pago";
import { sha256 } from "./security";

type ProductRecord = Prisma.ProductGetPayload<{
  include: {
    collection: true;
    media: true;
    variants: true;
  };
}>;

function productDto(product: ProductRecord): ProductDto {
  return {
    id: product.id,
    slug: product.slug,
    baseSku: product.baseSku,
    name: product.name,
    subtitle: product.subtitle,
    description: product.description,
    priceClp: product.priceClp,
    compareAtClp: product.compareAtClp,
    featured: product.featured,
    collection: product.collection
      ? { slug: product.collection.slug, name: product.collection.name }
      : null,
    media: product.media
      .toSorted((left, right) => left.sortOrder - right.sortOrder)
      .map((item) => ({
        url: item.url,
        alt: item.altText,
        provisional: item.provisional,
      })),
    variants: product.variants
      .filter((variant) => variant.active)
      .map((variant) => {
        const availableQuantity = Math.max(
          variant.stockOnHand - variant.stockReserved,
          0,
        );
        return {
          sku: variant.sku,
          size: variant.size,
          colorName: variant.colorName,
          colorHex: variant.colorHex,
          available: availableQuantity > 0,
          availableQuantity,
        };
      }),
  };
}

export async function listProducts(input: {
  cursor?: string;
  limit: number;
  collection?: string;
  featured?: boolean;
}): Promise<{ products: ProductDto[]; nextCursor: string | null }> {
  const db = getDatabase();
  if (!db) return listDemoProducts(input);

  const products = await db.product.findMany({
    where: {
      status: "ACTIVE",
      featured: input.featured,
      collection: input.collection
        ? { slug: input.collection, active: true }
        : undefined,
    },
    include: {
      collection: true,
      media: true,
      variants: true,
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    cursor: input.cursor ? { id: input.cursor } : undefined,
    skip: input.cursor ? 1 : 0,
    take: input.limit + 1,
  });
  const hasNext = products.length > input.limit;
  const visible = products.slice(0, input.limit).map(productDto);
  return {
    products: visible,
    nextCursor: hasNext ? visible.at(-1)?.id ?? null : null,
  };
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDto | null> {
  const db = getDatabase();
  if (!db) return getDemoProduct(slug);

  const product = await db.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      collection: true,
      media: true,
      variants: true,
    },
  });
  return product ? productDto(product) : null;
}

interface PendingOrder {
  id: string;
  token: string;
  email: string;
  expiresAt: Date;
  subtotalClp: number;
  shippingClp: number;
  totalClp: number;
  lines: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitPriceClp: number;
  }>;
}

async function createDatabaseOrder(
  db: PrismaClient,
  input: CheckoutRequest,
): Promise<PendingOrder> {
  const token = randomBytes(32).toString("base64url");
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1_000);

  return db.$transaction(
    async (tx) => {
      const zone = await tx.shippingZone.findFirst({
        where: { code: input.shipping.zoneCode, active: true },
      });
      if (!zone) {
        throw new AppError(
          422,
          "shipping_zone_unavailable",
          "Zona no disponible.",
        );
      }

      const variants = await tx.productVariant.findMany({
        where: {
          sku: { in: input.items.map((item) => item.sku) },
          active: true,
          product: { status: "ACTIVE" },
        },
        include: { product: true },
      });
      if (variants.length !== input.items.length) {
        throw new AppError(
          409,
          "product_unavailable",
          "Uno o más productos no están disponibles.",
        );
      }

      const bySku = new Map(variants.map((variant) => [variant.sku, variant]));
      let subtotalClp = 0;
      const lines = input.items.map((item) => {
        const variant = bySku.get(item.sku);
        if (!variant) {
          throw new AppError(
            409,
            "product_unavailable",
            "Producto no disponible.",
          );
        }
        if (variant.stockOnHand - variant.stockReserved < item.quantity) {
          throw new AppError(
            409,
            "insufficient_stock",
            `No hay stock suficiente para ${variant.product.name}.`,
          );
        }
        subtotalClp += variant.product.priceClp * item.quantity;
        return {
          variant,
          sku: variant.sku,
          name: variant.product.name,
          quantity: item.quantity,
          unitPriceClp: variant.product.priceClp,
        };
      });
      const shippingClp =
        subtotalClp >= zone.freeAboveClp ? 0 : zone.priceClp;
      const totalClp = subtotalClp + shippingClp;

      await tx.order.create({
        data: {
          id,
          publicTokenHash: sha256(token),
          externalReference: id,
          email: input.customer.email,
          firstName: input.customer.firstName,
          lastName: input.customer.lastName,
          phone: input.customer.phone,
          addressLine1: input.shipping.addressLine1,
          addressLine2: input.shipping.addressLine2,
          commune: input.shipping.commune,
          region: input.shipping.region,
          postalCode: input.shipping.postalCode,
          deliveryInstructions: input.shipping.instructions,
          subtotalClp,
          shippingClp,
          totalClp,
          reservationExpiresAt: expiresAt,
          shippingZoneId: zone.id,
          items: {
            create: lines.map((line) => ({
              variantId: line.variant.id,
              sku: line.sku,
              productName: line.name,
              size: line.variant.size,
              colorName: line.variant.colorName,
              unitPriceClp: line.unitPriceClp,
              quantity: line.quantity,
              lineTotalClp: line.unitPriceClp * line.quantity,
            })),
          },
          reservations: {
            create: lines.map((line) => ({
              variantId: line.variant.id,
              quantity: line.quantity,
              expiresAt,
            })),
          },
        },
      });

      for (const line of lines) {
        await tx.productVariant.update({
          where: { id: line.variant.id },
          data: { stockReserved: { increment: line.quantity } },
        });
      }

      return {
        id,
        token,
        email: input.customer.email,
        expiresAt,
        subtotalClp,
        shippingClp,
        totalClp,
        lines: lines.map((line) => ({
          sku: line.sku,
          name: line.name,
          quantity: line.quantity,
          unitPriceClp: line.unitPriceClp,
        })),
      };
    },
    { isolationLevel: "Serializable" },
  );
}

async function releaseFailedCheckout(
  db: PrismaClient,
  orderId: string,
): Promise<void> {
  await db.$transaction(async (tx) => {
    const reservations = await tx.reservation.findMany({
      where: { orderId, status: "ACTIVE" },
    });
    for (const reservation of reservations) {
      await tx.productVariant.update({
        where: { id: reservation.variantId },
        data: { stockReserved: { decrement: reservation.quantity } },
      });
    }
    await tx.reservation.updateMany({
      where: { orderId, status: "ACTIVE" },
      data: { status: "RELEASED" },
    });
    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
  });
}

export async function createCheckout(
  input: CheckoutRequest,
): Promise<CheckoutResult> {
  const db = getDatabase();
  if (!db) {
    const { order, token } = createDemoOrder(input);
    const preference = await createPaymentPreference({
      orderId: order.id,
      orderToken: token,
      email: input.customer.email,
      expiresAt: order.expiresAt,
      lines: order.lines,
      shippingClp: order.shippingClp,
    });
    setDemoPreference(order.id, preference.preferenceId);
    return checkoutResultFromDemo(order, token, preference.checkoutUrl);
  }

  const order = await createDatabaseOrder(db, input);
  try {
    const preference = await createPaymentPreference({
      orderId: order.id,
      orderToken: order.token,
      email: order.email,
      expiresAt: order.expiresAt,
      lines: order.lines,
      shippingClp: order.shippingClp,
    });
    await db.payment.create({
      data: {
        orderId: order.id,
        providerPreferenceId: preference.preferenceId,
        rawStatus: "pending",
        status: "PENDING",
        amountClp: order.totalClp,
      },
    });
    return {
      orderId: order.id,
      orderToken: order.token,
      checkoutUrl: preference.checkoutUrl,
      expiresAt: order.expiresAt.toISOString(),
      totals: {
        subtotalClp: order.subtotalClp,
        shippingClp: order.shippingClp,
        totalClp: order.totalClp,
        currency: "CLP",
      },
    };
  } catch (error) {
    await releaseFailedCheckout(db, order.id);
    throw error;
  }
}

function normalizedPaymentStatus(raw: string): PaymentStatus {
  switch (raw) {
    case "approved":
      return "APPROVED";
    case "rejected":
      return "REJECTED";
    case "refunded":
    case "charged_back":
      return "REFUNDED";
    case "cancelled":
      return "CANCELLED";
    case "pending":
    case "in_process":
      return "PENDING";
    default:
      return "REVIEW";
  }
}

export async function getOrderStatus(
  orderId: string,
  token: string,
): Promise<OrderStatusDto | null> {
  const db = getDatabase();
  if (!db) return getDemoOrderStatus(orderId, token);

  const order = await db.order.findFirst({
    where: { id: orderId, publicTokenHash: sha256(token) },
    include: {
      payments: { orderBy: { updatedAt: "desc" }, take: 1 },
    },
  });
  if (!order) return null;
  return {
    id: order.id,
    status: order.status,
    paymentStatus: order.payments[0]?.status ?? "PENDING",
    totalClp: order.totalClp,
    currency: "CLP",
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

async function claimWebhook(
  db: PrismaClient,
  input: {
    eventId: string;
    paymentId: string;
    requestId: string | null;
    eventType: string;
    payloadHash: string;
  },
): Promise<boolean> {
  const existing = await db.webhookEvent.findUnique({
    where: { providerEventId: input.eventId },
  });
  if (
    existing &&
    ["RECEIVED", "PROCESSING", "PROCESSED"].includes(existing.status)
  ) {
    return false;
  }
  if (existing) {
    const requeued = await db.webhookEvent.updateMany({
      where: { id: existing.id, status: "FAILED" },
      data: {
        paymentId: input.paymentId,
        requestId: input.requestId,
        eventType: input.eventType,
        payloadHash: input.payloadHash,
        status: "RECEIVED",
        attempts: 0,
        nextAttemptAt: new Date(),
        lockedAt: null,
        failureCode: null,
      },
    });
    return requeued.count === 1;
  }
  try {
    await db.webhookEvent.create({
      data: {
        providerEventId: input.eventId,
        paymentId: input.paymentId,
        requestId: input.requestId,
        eventType: input.eventType,
        payloadHash: input.payloadHash,
      },
    });
    return true;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return false;
    }
    throw error;
  }
}

export async function enqueueMercadoPagoWebhook(input: {
  eventId: string;
  requestId: string | null;
  eventType: string;
  paymentId: string;
  payloadHash: string;
}): Promise<"queued" | "processed" | "duplicate"> {
  const db = getDatabase();
  if (!db) {
    if (!claimDemoWebhook(input.eventId)) return "duplicate";
    const payment = await fetchMercadoPagoPayment(input.paymentId);
    applyDemoPayment(payment);
    return "processed";
  }

  return (await claimWebhook(db, input)) ? "queued" : "duplicate";
}

async function applyDatabasePayment(
  db: PrismaClient,
  payment: MercadoPagoPayment,
): Promise<void> {
  await db.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({
        where: { externalReference: payment.externalReference },
        include: { reservations: true },
      });
      if (!order) {
        throw new AppError(404, "order_not_found", "Pedido no encontrado.");
      }

      const normalized = normalizedPaymentStatus(payment.status);
      const mismatched =
        payment.currency !== order.currency ||
        payment.amountClp !== order.totalClp;
      await tx.payment.upsert({
        where: { providerPaymentId: payment.id },
        create: {
          orderId: order.id,
          providerPaymentId: payment.id,
          rawStatus: payment.status,
          status: mismatched ? "REVIEW" : normalized,
          amountClp: payment.amountClp,
          currency: payment.currency,
        },
        update: {
          rawStatus: payment.status,
          status: mismatched ? "REVIEW" : normalized,
          amountClp: payment.amountClp,
          currency: payment.currency,
        },
      });

      if (mismatched) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "REVIEW" },
        });
        return;
      }
      if (normalized !== "APPROVED" || order.status === "PAID") return;

      const activeReservations = order.reservations.filter(
        (reservation) => reservation.status === "ACTIVE",
      );
      const expired =
        order.reservationExpiresAt <= new Date() ||
        activeReservations.length === 0;
      if (expired) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "REVIEW" },
        });
        await tx.payment.update({
          where: { providerPaymentId: payment.id },
          data: { status: "REVIEW" },
        });
        return;
      }

      for (const reservation of activeReservations) {
        await tx.productVariant.update({
          where: { id: reservation.variantId },
          data: {
            stockOnHand: { decrement: reservation.quantity },
            stockReserved: { decrement: reservation.quantity },
          },
        });
      }
      await tx.reservation.updateMany({
        where: { orderId: order.id, status: "ACTIVE" },
        data: { status: "CONSUMED" },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });
    },
    { isolationLevel: "Serializable" },
  );
}

export async function processMercadoPagoWebhook(input: {
  eventId: string;
  requestId: string | null;
  eventType: string;
  paymentId: string;
  payloadHash: string;
}): Promise<"processed" | "duplicate"> {
  const db = getDatabase();
  if (!db) {
    if (!claimDemoWebhook(input.eventId)) return "duplicate";
    const payment = await fetchMercadoPagoPayment(input.paymentId);
    applyDemoPayment(payment);
    return "processed";
  }

  const claimed = await claimWebhook(db, input);
  if (!claimed) return "duplicate";
  try {
    const payment = await fetchMercadoPagoPayment(input.paymentId);
    await applyDatabasePayment(db, payment);
    await db.webhookEvent.update({
      where: { providerEventId: input.eventId },
      data: { status: "PROCESSED", processedAt: new Date() },
    });
    return "processed";
  } catch (error) {
    await db.webhookEvent.update({
      where: { providerEventId: input.eventId },
      data: { status: "FAILED", failureCode: "payment_processing_failed" },
    });
    throw error;
  }
}
