import "server-only";

import type { z } from "zod";

import type {
  catalogProductUpsertSchema,
  inventoryUpdateSchema,
  influencerUpsertSchema,
  orderStatusUpdateSchema,
  shippingZoneUpsertSchema,
  variantUpsertSchema,
} from "@/lib/schemas/admin";

import type { AdminPrincipal } from "./admin-auth";
import { auditAdminMutation } from "./admin-auth";
import { getDatabase } from "./db";
import { AppError, ConfigurationError } from "./errors";
import { deleteManagedMediaObject } from "./media-service";

function db() {
  const database = getDatabase();
  if (!database) {
    throw new ConfigurationError(
      "El panel administrativo requiere PostgreSQL.",
    );
  }
  return database;
}

export async function adminList(resource: string) {
  switch (resource) {
    case "dashboard": {
      const database = db();
      const [products, activeProducts, influencers, activeInfluencers, orders, openOrders, lowStock, media] = await Promise.all([
        database.product.count(),
        database.product.count({ where: { status: "ACTIVE" } }),
        database.influencer.count(),
        database.influencer.count({ where: { status: "ACTIVE" } }),
        database.order.count(),
        database.order.count({ where: { status: { in: ["PAID", "PREPARING", "SHIPPED", "REVIEW"] } } }),
        database.productVariant.count({ where: { active: true, stockOnHand: { lte: 5 } } }),
        database.influencerMedia.count(),
      ]);
      return { products, activeProducts, influencers, activeInfluencers, orders, openOrders, lowStock, media };
    }
    case "catalog":
      return db().product.findMany({
        select: {
          id: true,
          slug: true,
          baseSku: true,
          name: true,
          subtitle: true,
          description: true,
          status: true,
          priceClp: true,
          featured: true,
          updatedAt: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take: 200,
      });
    case "inventory":
      return db().productVariant.findMany({
        select: {
          id: true,
          sku: true,
          size: true,
          colorName: true,
          stockOnHand: true,
          stockReserved: true,
          active: true,
          product: { select: { name: true, slug: true } },
          updatedAt: true,
        },
        orderBy: { sku: "asc" },
        take: 500,
      });
    case "shipping-zones":
      return db().shippingZone.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          communes: true,
          priceClp: true,
          freeAboveClp: true,
          active: true,
          updatedAt: true,
        },
        orderBy: { code: "asc" },
        take: 100,
      });
    case "orders":
      return db().order.findMany({
        select: {
          id: true,
          status: true,
          email: true,
          firstName: true,
          lastName: true,
          commune: true,
          totalClp: true,
          currency: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
    case "media":
      return db().productMedia.findMany({
        select: { id: true, url: true, altText: true, provisional: true, productId: true, product: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 300,
      });
    case "variants":
      return db().productVariant.findMany({ select: { id: true, productId: true, sku: true, size: true, colorName: true, colorHex: true, active: true, stockOnHand: true }, orderBy: { sku: "asc" }, take: 500 });
    case "influencers":
      return db().influencer.findMany({
        select: {
          id: true,
          slug: true,
          displayName: true,
          legalName: true,
          pronouns: true,
          bio: true,
          location: true,
          email: true,
          instagramHandle: true,
          status: true,
          featured: true,
          sortOrder: true,
          updatedAt: true,
          _count: { select: { media: true } },
          media: { select: { url: true, altText: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        },
        orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
        take: 200,
      });
    case "influencer-media":
      return db().influencerMedia.findMany({
        select: {
          id: true,
          influencerId: true,
          url: true,
          altText: true,
          caption: true,
          kind: true,
          provisional: true,
          sortOrder: true,
          createdAt: true,
          influencer: { select: { displayName: true } },
        },
        orderBy: [{ influencerId: "asc" }, { sortOrder: "asc" }],
        take: 500,
      });
    case "audit":
      return db().auditLog.findMany({
        select: { id: true, actor: true, action: true, targetType: true, targetId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 250,
      });
    default:
      throw new AppError(404, "admin_resource_not_found", "Recurso no encontrado.");
  }
}

export async function upsertInfluencer(
  principal: AdminPrincipal,
  input: z.infer<typeof influencerUpsertSchema>,
) {
  const normalized = {
    slug: input.slug,
    displayName: input.displayName,
    legalName: input.legalName || null,
    pronouns: input.pronouns || null,
    bio: input.bio,
    location: input.location || null,
    email: input.email || null,
    instagramHandle: input.instagramHandle
      ? input.instagramHandle.replace(/^@/, "")
      : null,
    status: input.status,
    featured: input.featured,
    sortOrder: input.sortOrder,
  };
  const influencer = input.id
    ? await db().influencer.update({ where: { id: input.id }, data: normalized })
    : await db().influencer.create({ data: normalized });
  await auditAdminMutation(
    principal,
    input.id ? "influencer.update" : "influencer.create",
    "Influencer",
    influencer.id,
  );
  return influencer;
}

export async function deleteAdminResource(
  principal: AdminPrincipal,
  resource: string,
  id: string,
) {
  if (resource === "influencer-media") {
    const media = await db().influencerMedia.findUnique({ where: { id }, select: { url: true } });
    if (!media) throw new AppError(404, "media_not_found", "Fotografía no encontrada.");
    await deleteManagedMediaObject(media.url);
    await db().influencerMedia.delete({ where: { id } });
    await auditAdminMutation(principal, "influencer-media.delete", "InfluencerMedia", id);
    return { id, deleted: true };
  }
  if (resource === "media") {
    const media = await db().productMedia.findUnique({ where: { id }, select: { url: true } });
    if (!media) throw new AppError(404, "media_not_found", "Fotografía no encontrada.");
    await deleteManagedMediaObject(media.url);
    await db().productMedia.delete({ where: { id } });
    await auditAdminMutation(principal, "product-media.delete", "ProductMedia", id);
    return { id, deleted: true };
  }
  if (resource === "influencers") {
    await db().influencer.update({ where: { id }, data: { status: "ARCHIVED", featured: false } });
    await auditAdminMutation(principal, "influencer.archive", "Influencer", id);
    return { id, archived: true };
  }
  if (resource === "catalog") {
    await db().product.update({ where: { id }, data: { status: "ARCHIVED", featured: false } });
    await auditAdminMutation(principal, "catalog.archive", "Product", id);
    return { id, archived: true };
  }
  throw new AppError(405, "delete_not_allowed", "Este recurso no admite eliminación.");
}

export async function upsertVariant(principal: AdminPrincipal, input: z.infer<typeof variantUpsertSchema>) {
  const product = await db().product.findUnique({ where: { id: input.productId }, select: { baseSku: true } });
  if (!product) throw new AppError(404, "product_not_found", "Producto no encontrado.");
  if (!input.sku.startsWith(`${product.baseSku}-`) || input.sku.length <= product.baseSku.length + 1) throw new AppError(422, "invalid_variant_sku", "El SKU debe pertenecer al SKU base del producto.");
  const existing = input.id ? await db().productVariant.findUnique({ where: { id: input.id } }) : null;
  if (existing && existing.productId !== input.productId) throw new AppError(409, "variant_product_mismatch", "La variante no pertenece al producto.");
  if (existing && input.stockOnHand < existing.stockReserved) throw new AppError(409, "stock_below_reserved", "El stock no puede ser menor que el reservado.");
  const data = { productId: input.productId, sku: input.sku, size: input.size, colorName: input.colorName, colorHex: input.colorHex.toUpperCase(), active: input.active, stockOnHand: input.stockOnHand };
  const variant = input.id ? await db().productVariant.update({ where: { id: input.id }, data }) : await db().productVariant.create({ data });
  await auditAdminMutation(principal, input.id ? "variant.update" : "variant.create", "ProductVariant", variant.id);
  return { id: variant.id, sku: variant.sku, productId: variant.productId };
}

export async function upsertCatalogProduct(
  principal: AdminPrincipal,
  input: z.infer<typeof catalogProductUpsertSchema>,
) {
  const product = input.id
    ? await db().product.update({
        where: { id: input.id },
        data: {
          slug: input.slug,
          baseSku: input.baseSku,
          name: input.name,
          subtitle: input.subtitle,
          description: input.description,
          priceClp: input.priceClp,
          featured: input.featured,
          status: input.status,
        },
        select: { id: true, slug: true, status: true },
      })
    : await db().product.create({
        data: input,
        select: { id: true, slug: true, status: true },
      });
  await auditAdminMutation(
    principal,
    input.id ? "catalog.update" : "catalog.create",
    "Product",
    product.id,
  );
  return product;
}

export async function updateInventory(
  principal: AdminPrincipal,
  input: z.infer<typeof inventoryUpdateSchema>,
) {
  const variant = await db().productVariant.findUnique({
    where: { sku: input.sku },
  });
  if (!variant) {
    throw new AppError(404, "variant_not_found", "Variante no encontrada.");
  }
  if (input.stockOnHand < variant.stockReserved) {
    throw new AppError(
      409,
      "stock_below_reserved",
      "El stock físico no puede ser menor que el reservado.",
    );
  }
  const updated = await db().productVariant.update({
    where: { id: variant.id },
    data: { stockOnHand: input.stockOnHand },
    select: {
      id: true,
      sku: true,
      stockOnHand: true,
      stockReserved: true,
      updatedAt: true,
    },
  });
  await auditAdminMutation(
    principal,
    "inventory.update",
    "ProductVariant",
    updated.id,
  );
  return updated;
}

export async function upsertShippingZone(
  principal: AdminPrincipal,
  input: z.infer<typeof shippingZoneUpsertSchema>,
) {
  const zone = await db().shippingZone.upsert({
    where: { code: input.code },
    update: input,
    create: input,
    select: {
      id: true,
      code: true,
      name: true,
      priceClp: true,
      freeAboveClp: true,
      active: true,
    },
  });
  await auditAdminMutation(
    principal,
    "shipping-zone.upsert",
    "ShippingZone",
    zone.id,
  );
  return zone;
}

const allowedTransitions: Record<string, readonly string[]> = {
  PAID: ["PREPARING", "CANCELLED", "REVIEW"],
  PREPARING: ["SHIPPED", "CANCELLED", "REVIEW"],
  SHIPPED: ["COMPLETED", "REVIEW"],
  REVIEW: ["PREPARING", "CANCELLED"],
};

export async function updateOrderStatus(
  principal: AdminPrincipal,
  input: z.infer<typeof orderStatusUpdateSchema>,
) {
  const order = await db().order.findUnique({ where: { id: input.orderId } });
  if (!order) throw new AppError(404, "order_not_found", "Pedido no encontrado.");
  if (!(allowedTransitions[order.status] ?? []).includes(input.status)) {
    throw new AppError(
      409,
      "invalid_order_transition",
      "Transición de pedido no permitida.",
    );
  }
  if (
    principal.role === "FULFILLMENT" &&
    !["PREPARING", "SHIPPED", "COMPLETED"].includes(input.status)
  ) {
    throw new AppError(403, "forbidden", "Permiso insuficiente.");
  }
  const updated = await db().order.update({
    where: { id: order.id },
    data: { status: input.status },
    select: { id: true, status: true, updatedAt: true },
  });
  await auditAdminMutation(
    principal,
    "order.status.update",
    "Order",
    updated.id,
  );
  return updated;
}
