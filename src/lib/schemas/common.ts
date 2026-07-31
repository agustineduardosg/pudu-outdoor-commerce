import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const skuSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(3)
  .max(64)
  .regex(/^[A-Z0-9][A-Z0-9-]*$/);

export const cursorSchema = z.string().uuid().optional();

export const paginationSchema = z.object({
  cursor: cursorSchema,
  limit: z.coerce.number().int().min(1).max(48).default(12),
});
