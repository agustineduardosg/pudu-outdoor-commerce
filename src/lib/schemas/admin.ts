import { z } from "zod";

export const adminResourceSchema = z.enum([
  "catalog",
  "inventory",
  "orders",
  "shipping-zones",
  "media",
  "variants",
  "dashboard",
  "influencers",
  "influencer-media",
  "audit",
]);

export const adminDeleteSchema = z.object({
  id: z.string().uuid(),
}).strict();

export const influencerUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  displayName: z.string().trim().min(2).max(120),
  legalName: z.string().trim().max(160).nullable().optional(),
  pronouns: z.string().trim().max(40).nullable().optional(),
  bio: z.string().trim().min(20).max(5_000),
  location: z.string().trim().max(160).nullable().optional(),
  email: z.string().trim().toLowerCase().email().max(254).nullable().optional(),
  instagramHandle: z.string().trim().regex(/^@?[A-Za-z0-9._]{1,30}$/).nullable().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(10_000),
}).strict();

export const variantUpsertSchema = z.object({
  id: z.string().uuid().optional(), productId: z.string().uuid(),
  sku: z.string().trim().toUpperCase().min(5).max(64).regex(/^[A-Z0-9-]+$/),
  size: z.string().trim().min(1).max(32), colorName: z.string().trim().min(2).max(80),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/), active: z.boolean(),
  stockOnHand: z.number().int().min(0).max(1_000_000),
}).strict();

export const adminLoginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(12).max(200),
    totp: z.string().regex(/^\d{6}$/).optional(),
  })
  .strict();

export const adminBootstrapSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z
      .string()
      .min(16)
      .max(200)
      .regex(/[a-z]/)
      .regex(/[A-Z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    totpSecret: z
      .string()
      .trim()
      .toUpperCase()
      .min(16)
      .max(128)
      .regex(/^[A-Z2-7]+=*$/),
  })
  .strict();

export const inventoryUpdateSchema = z
  .object({
    sku: z.string().trim().toUpperCase().min(3).max(64),
    stockOnHand: z.number().int().min(0).max(1_000_000),
  })
  .strict();

export const shippingZoneUpsertSchema = z
  .object({
    code: z.string().trim().toUpperCase().min(2).max(32),
    name: z.string().trim().min(2).max(120),
    communes: z.array(z.string().trim().min(2).max(120)).max(400),
    priceClp: z.number().int().min(0).max(1_000_000),
    freeAboveClp: z.number().int().min(0).max(100_000_000),
    active: z.boolean(),
  })
  .strict();

export const orderStatusUpdateSchema = z
  .object({
    orderId: z.string().uuid(),
    status: z.enum([
      "PREPARING",
      "SHIPPED",
      "COMPLETED",
      "CANCELLED",
      "REVIEW",
    ]),
  })
  .strict();

export const catalogProductUpsertSchema = z
  .object({
    id: z.string().uuid().optional(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
    baseSku: z.string().trim().toUpperCase().min(3).max(64),
    name: z.string().trim().min(2).max(160),
    subtitle: z.string().trim().min(2).max(200),
    description: z.string().trim().min(20).max(5_000),
    priceClp: z.number().int().min(0).max(100_000_000),
    featured: z.boolean(),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  })
  .strict();

export const mediaRequestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("presign"),
    productId: z.string().uuid(),
    fileName: z.string().trim().min(1).max(180),
    contentType: z.enum(["image/png", "image/jpeg", "image/webp"]),
    size: z.number().int().positive().max(8 * 1024 * 1024),
  }).strict(),
  z.object({
    action: z.literal("associate"),
    productId: z.string().uuid(),
    key: z.string().min(10).max(500),
    url: z.string().url().max(2048),
    altText: z.string().trim().min(3).max(240),
  }).strict(),
]);

export const influencerMediaRequestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("presign"),
    influencerId: z.string().uuid(),
    fileName: z.string().trim().min(1).max(180),
    contentType: z.enum(["image/png", "image/jpeg", "image/webp"]),
    size: z.number().int().positive().max(8 * 1024 * 1024),
  }).strict(),
  z.object({
    action: z.literal("associate"),
    influencerId: z.string().uuid(),
    key: z.string().min(10).max(500),
    url: z.string().url().max(2048),
    altText: z.string().trim().min(3).max(240),
    caption: z.string().trim().max(300).nullable().optional(),
    kind: z.enum(["PORTRAIT", "LIFESTYLE", "CAMPAIGN", "PRODUCT"]),
    sortOrder: z.number().int().min(0).max(10_000),
  }).strict(),
]);
