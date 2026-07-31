import { z } from "zod";

export const mercadoPagoWebhookSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    live_mode: z.boolean(),
    type: z.string().min(1).max(80),
    action: z.string().min(1).max(120),
    data: z.object({
      id: z.union([z.string(), z.number()]).transform(String),
    }),
  })
  .passthrough();

export const mercadoPagoPaymentSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    status: z.string().min(1).max(80),
    external_reference: z.string().uuid(),
    transaction_amount: z.number().nonnegative(),
    currency_id: z.string().length(3),
  })
  .passthrough();

export const mercadoPagoPreferenceSchema = z
  .object({
    id: z.string().min(1),
    init_point: z.string().url(),
    sandbox_init_point: z.string().url().optional(),
  })
  .passthrough();
