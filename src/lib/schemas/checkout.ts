import { z } from "zod";

import { skuSchema } from "./common";

const humanNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[\p{L}\p{M}' -]+$/u);

const shortTextSchema = z.string().trim().min(1).max(120);

export const checkoutSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            sku: skuSchema,
            quantity: z.number().int().min(1).max(10),
          })
          .strict(),
      )
      .min(1)
      .max(20),
    customer: z
      .object({
        email: z.string().trim().toLowerCase().email().max(254),
        firstName: humanNameSchema,
        lastName: humanNameSchema,
        phone: z
          .string()
          .trim()
          .min(8)
          .max(24)
          .regex(/^\+?[0-9 ()-]+$/),
      })
      .strict(),
    shipping: z
      .object({
        zoneCode: z
          .string()
          .trim()
          .toUpperCase()
          .min(2)
          .max(32)
          .regex(/^[A-Z0-9-]+$/),
        addressLine1: shortTextSchema,
        addressLine2: z.string().trim().max(120).optional(),
        commune: shortTextSchema,
        region: shortTextSchema,
        postalCode: z
          .string()
          .trim()
          .max(12)
          .regex(/^[A-Za-z0-9 -]*$/)
          .optional(),
        instructions: z.string().trim().max(300).optional(),
      })
      .strict(),
  })
  .strict()
  .superRefine((value, context) => {
    const seen = new Set<string>();
    for (const [index, item] of value.items.entries()) {
      if (seen.has(item.sku)) {
        context.addIssue({
          code: "custom",
          message: "Cada SKU debe aparecer una sola vez.",
          path: ["items", index, "sku"],
        });
      }
      seen.add(item.sku);
    }
  });

export type CheckoutRequest = z.infer<typeof checkoutSchema>;
