ALTER TYPE "WebhookStatus" ADD VALUE 'PROCESSING';

CREATE TYPE "EmailDeliveryType" AS ENUM ('ORDER_PAID');
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

ALTER TABLE "WebhookEvent"
ADD COLUMN "paymentId" VARCHAR(120),
ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "lockedAt" TIMESTAMP(3);

DROP INDEX "WebhookEvent_status_receivedAt_idx";
CREATE INDEX "WebhookEvent_status_nextAttemptAt_idx"
ON "WebhookEvent"("status", "nextAttemptAt");

CREATE TABLE "EmailDelivery" (
  "id" UUID NOT NULL,
  "orderId" UUID NOT NULL,
  "type" "EmailDeliveryType" NOT NULL,
  "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedAt" TIMESTAMP(3),
  "providerMessageId" VARCHAR(160),
  "failureCode" VARCHAR(120),
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EmailDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailDelivery_orderId_type_key"
ON "EmailDelivery"("orderId", "type");

CREATE INDEX "EmailDelivery_status_nextAttemptAt_idx"
ON "EmailDelivery"("status", "nextAttemptAt");

ALTER TABLE "EmailDelivery"
ADD CONSTRAINT "EmailDelivery_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
