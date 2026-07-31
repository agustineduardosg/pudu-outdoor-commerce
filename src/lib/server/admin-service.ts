import "server-only";

import type { z } from "zod";

import type {
  catalogProductUpsertSchema,
  inventoryUpdateSchema,
  orderStatusUpdateSchema,
  shippingZoneUpsertSchema,
  variantUpsertSchema,
} from "@/lib/schemas/admin";

import type { AdminPrincipal } from "./admin-auth";
import { auditAdminMutation } from "./admin-auth";
import { getDatabase } from "./db";
import { AppError, ConfigurationError } from "./errors";

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
    case "catalog":
      return db().product.findMany({
        select: {
          id: true,
          slug: true,
          baseSku: true,
          name: true,
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
    default:
      throw new AppError(404, "admin_resource_not_found", "Recurso no encontrado.");
  }
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
