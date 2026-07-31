import { Prisma, PrismaClient } from "@prisma/client";
import { Resend } from "resend";

import {
  normalizePaymentStatus,
  paidEmailContent,
  paidEmailIdempotencyKey,
  parseMercadoPagoPayment,
  retryDelayMs,
  safeFailureCode,
} from "./worker-lib.mjs";

const prisma = new PrismaClient();
const pollIntervalMs = numericEnv("WORKER_POLL_INTERVAL_MS", 5_000, 1_000, 60_000);
const batchSize = numericEnv("WORKER_BATCH_SIZE", 25, 1, 100);
const maxAttempts = numericEnv("WORKER_MAX_ATTEMPTS", 8, 1, 20);
const lockTimeoutMs = numericEnv(
  "WORKER_LOCK_TIMEOUT_MS",
  10 * 60_000,
  60_000,
  60 * 60_000,
);
let stopping = false;

function numericEnv(name, fallback, minimum, maximum) {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : fallback;
}

function log(level, event, fields = {}) {
  process.stdout.write(
    `${JSON.stringify({
      level,
      event,
      service: "pudu-worker",
      time: new Date().toISOString(),
      ...fields,
    })}\n`,
  );
}

async function releaseExpiredReservations() {
  const now = new Date();
  return prisma.$transaction(
    async (transaction) => {
      const expired = await transaction.reservation.findMany({
        where: { status: "ACTIVE", expiresAt: { lte: now } },
        orderBy: { expiresAt: "asc" },
        take: batchSize,
        select: {
          id: true,
          orderId: true,
          variantId: true,
          quantity: true,
        },
      });

      const affectedOrders = new Set();
      let released = 0;
      for (const reservation of expired) {
        const claimed = await transaction.reservation.updateMany({
          where: { id: reservation.id, status: "ACTIVE" },
          data: { status: "RELEASED" },
        });
        if (claimed.count !== 1) continue;

        const stock = await transaction.productVariant.updateMany({
          where: {
            id: reservation.variantId,
            stockReserved: { gte: reservation.quantity },
          },
          data: { stockReserved: { decrement: reservation.quantity } },
        });
        if (stock.count !== 1) {
          await transaction.order.update({
            where: { id: reservation.orderId },
            data: { status: "REVIEW" },
          });
          log("error", "reservation_stock_invariant_failed", {
            reservationId: reservation.id,
            orderId: reservation.orderId,
          });
          continue;
        }

        affectedOrders.add(reservation.orderId);
        released += 1;
      }

      for (const orderId of affectedOrders) {
        const remaining = await transaction.reservation.count({
          where: { orderId, status: "ACTIVE" },
        });
        if (remaining === 0) {
          await transaction.order.updateMany({
            where: { id: orderId, status: "PENDING_PAYMENT" },
            data: { status: "CANCELLED" },
          });
        }
      }

      return { released, scanned: expired.length };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

async function recoverStaleClaims() {
  const staleBefore = new Date(Date.now() - lockTimeoutMs);
  const [webhooks, emails] = await prisma.$transaction([
    prisma.webhookEvent.updateMany({
      where: { status: "PROCESSING", lockedAt: { lte: staleBefore } },
      data: {
        status: "RECEIVED",
        lockedAt: null,
        nextAttemptAt: new Date(),
        failureCode: "stale_lock_recovered",
      },
    }),
    prisma.emailDelivery.updateMany({
      where: { status: "PROCESSING", lockedAt: { lte: staleBefore } },
      data: {
        status: "PENDING",
        lockedAt: null,
        nextAttemptAt: new Date(),
        failureCode: "stale_lock_recovered",
      },
    }),
  ]);
  if (webhooks.count || emails.count) {
    log("warn", "stale_claims_recovered", {
      webhookCount: webhooks.count,
      emailCount: emails.count,
    });
  }
}

async function fetchPayment(paymentId) {
  if (!paymentId || !/^[A-Za-z0-9-]{1,80}$/.test(paymentId)) {
    throw new Error("invalid_payment_id");
  }
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error("missing_mercado_pago_configuration");

  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
        accept: "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok) throw new Error("payment_provider_request_failed");
  return parseMercadoPagoPayment(await response.json());
}

async function claimWebhookEvents() {
  const now = new Date();
  const candidates = await prisma.webhookEvent.findMany({
    where: {
      status: "RECEIVED",
      nextAttemptAt: { lte: now },
      attempts: { lt: maxAttempts },
    },
    orderBy: { receivedAt: "asc" },
    take: batchSize,
    select: { id: true },
  });

  const claimed = [];
  for (const candidate of candidates) {
    const result = await prisma.webhookEvent.updateMany({
      where: { id: candidate.id, status: "RECEIVED", nextAttemptAt: { lte: now } },
      data: {
        status: "PROCESSING",
        attempts: { increment: 1 },
        lockedAt: now,
        failureCode: null,
      },
    });
    if (result.count === 1) {
      const event = await prisma.webhookEvent.findUnique({
        where: { id: candidate.id },
      });
      if (event) claimed.push(event);
    }
  }
  return claimed;
}

async function applyPayment(event, payment) {
  return withSerializableRetry(async () =>
    prisma.$transaction(
      async (transaction) => {
        const order = await transaction.order.findUnique({
          where: { externalReference: payment.externalReference },
          include: {
            reservations: {
              include: { variant: true },
            },
          },
        });
        if (!order) throw new Error("order_not_found");

        const normalized = normalizePaymentStatus(payment.status);
        const mismatched =
          payment.currency !== order.currency ||
          payment.amountClp !== order.totalClp;
        await transaction.payment.upsert({
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
          await transaction.order.update({
            where: { id: order.id },
            data: { status: "REVIEW" },
          });
        } else if (normalized === "APPROVED") {
          const paidLifecycle = ["PAID", "PREPARING", "SHIPPED", "COMPLETED"];
          if (paidLifecycle.includes(order.status)) {
            await ensurePaidEmail(transaction, order.id);
          } else {
            const active = order.reservations.filter(
              (reservation) => reservation.status === "ACTIVE",
            );
            const invalidReservation =
              order.reservationExpiresAt <= new Date() ||
              active.length === 0 ||
              active.some(
                (reservation) =>
                  reservation.variant.stockOnHand < reservation.quantity ||
                  reservation.variant.stockReserved < reservation.quantity,
              );

            if (invalidReservation) {
              await transaction.order.update({
                where: { id: order.id },
                data: { status: "REVIEW" },
              });
              await transaction.payment.update({
                where: { providerPaymentId: payment.id },
                data: { status: "REVIEW" },
              });
            } else {
              for (const reservation of active) {
                const stock = await transaction.productVariant.updateMany({
                  where: {
                    id: reservation.variantId,
                    stockOnHand: { gte: reservation.quantity },
                    stockReserved: { gte: reservation.quantity },
                  },
                  data: {
                    stockOnHand: { decrement: reservation.quantity },
                    stockReserved: { decrement: reservation.quantity },
                  },
                });
                if (stock.count !== 1) {
                  throw new Error("concurrent_stock_update");
                }
              }
              await transaction.reservation.updateMany({
                where: { orderId: order.id, status: "ACTIVE" },
                data: { status: "CONSUMED" },
              });
              await transaction.order.update({
                where: { id: order.id },
                data: { status: "PAID" },
              });
              await ensurePaidEmail(transaction, order.id);
            }
          }
        }

        await transaction.webhookEvent.updateMany({
          where: { id: event.id, status: "PROCESSING" },
          data: {
            status: "PROCESSED",
            processedAt: new Date(),
            lockedAt: null,
            failureCode: null,
          },
        });
        return order.id;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    ),
  );
}

async function ensurePaidEmail(transaction, orderId) {
  await transaction.emailDelivery.upsert({
    where: { orderId_type: { orderId, type: "ORDER_PAID" } },
    create: { orderId, type: "ORDER_PAID" },
    update: {},
  });
}

async function withSerializableRetry(operation) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (
        attempt < 3 &&
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2034"
      ) {
        continue;
      }
      throw error;
    }
  }
}

async function failWebhook(event, error) {
  const failureCode = safeFailureCode(error);
  const exhausted = event.attempts >= maxAttempts;
  await prisma.webhookEvent.updateMany({
    where: { id: event.id, status: "PROCESSING" },
    data: {
      status: exhausted ? "FAILED" : "RECEIVED",
      lockedAt: null,
      nextAttemptAt: new Date(Date.now() + retryDelayMs(event.attempts)),
      failureCode,
    },
  });
  log(exhausted ? "error" : "warn", "webhook_processing_failed", {
    webhookEventId: event.id,
    failureCode,
    attempt: event.attempts,
  });
}

async function processWebhooks() {
  const events = await claimWebhookEvents();
  for (const event of events) {
    try {
      const payment = await fetchPayment(event.paymentId);
      const orderId = await applyPayment(event, payment);
      log("info", "webhook_processed", {
        webhookEventId: event.id,
        orderId,
      });
    } catch (error) {
      await failWebhook(event, error);
    }
  }
  return events.length;
}

async function claimEmailDeliveries() {
  const now = new Date();
  const candidates = await prisma.emailDelivery.findMany({
    where: {
      status: "PENDING",
      nextAttemptAt: { lte: now },
      attempts: { lt: maxAttempts },
    },
    orderBy: { createdAt: "asc" },
    take: batchSize,
    select: { id: true },
  });

  const claimed = [];
  for (const candidate of candidates) {
    const result = await prisma.emailDelivery.updateMany({
      where: { id: candidate.id, status: "PENDING", nextAttemptAt: { lte: now } },
      data: {
        status: "PROCESSING",
        attempts: { increment: 1 },
        lockedAt: now,
        failureCode: null,
      },
    });
    if (result.count === 1) {
      const delivery = await prisma.emailDelivery.findUnique({
        where: { id: candidate.id },
        include: {
          order: {
            include: { items: { orderBy: { id: "asc" } } },
          },
        },
      });
      if (delivery) claimed.push(delivery);
    }
  }
  return claimed;
}

async function failEmail(delivery, error) {
  const failureCode = safeFailureCode(error);
  const exhausted = delivery.attempts >= maxAttempts;
  await prisma.emailDelivery.updateMany({
    where: { id: delivery.id, status: "PROCESSING" },
    data: {
      status: exhausted ? "FAILED" : "PENDING",
      lockedAt: null,
      nextAttemptAt: new Date(Date.now() + retryDelayMs(delivery.attempts)),
      failureCode,
    },
  });
  log(exhausted ? "error" : "warn", "email_delivery_failed", {
    deliveryId: delivery.id,
    orderId: delivery.orderId,
    failureCode,
    attempt: delivery.attempts,
  });
}

async function processEmails() {
  const deliveries = await claimEmailDeliveries();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const resend = apiKey ? new Resend(apiKey) : null;

  for (const delivery of deliveries) {
    try {
      if (!resend || !from) throw new Error("missing_resend_configuration");
      const content = paidEmailContent(delivery.order);
      const result = await resend.emails.send(
        {
          from,
          to: delivery.order.email,
          subject: content.subject,
          text: content.text,
        },
        { idempotencyKey: paidEmailIdempotencyKey(delivery.orderId) },
      );
      if (result.error || !result.data?.id) {
        throw new Error("email_provider_request_failed");
      }
      await prisma.emailDelivery.updateMany({
        where: { id: delivery.id, status: "PROCESSING" },
        data: {
          status: "SENT",
          sentAt: new Date(),
          providerMessageId: result.data.id,
          lockedAt: null,
          failureCode: null,
        },
      });
      log("info", "email_delivered", {
        deliveryId: delivery.id,
        orderId: delivery.orderId,
        providerMessageId: result.data.id,
      });
    } catch (error) {
      await failEmail(delivery, error);
    }
  }
  return deliveries.length;
}

async function tick() {
  try {
    await recoverStaleClaims();
    const reservations = await releaseExpiredReservations();
    const webhookCount = await processWebhooks();
    const emailCount = await processEmails();
    if (reservations.scanned || webhookCount || emailCount) {
      log("info", "worker_iteration_completed", {
        releasedReservations: reservations.released,
        scannedReservations: reservations.scanned,
        webhookCount,
        emailCount,
      });
    }
  } catch (error) {
    log("error", "worker_iteration_failed", {
      failureCode: safeFailureCode(error),
    });
  }
}

async function shutdown(signal) {
  if (stopping) return;
  stopping = true;
  log("info", "worker_stopping", { signal });
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

log("info", "worker_started", { pollIntervalMs, batchSize });
while (!stopping) {
  await tick();
  await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
}
