import {
  adminResourceSchema,
  adminDeleteSchema,
  catalogProductUpsertSchema,
  inventoryUpdateSchema,
  influencerMediaRequestSchema,
  influencerUpsertSchema,
  mediaRequestSchema,
  orderStatusUpdateSchema,
  shippingZoneUpsertSchema,
  variantUpsertSchema,
} from "@/lib/schemas/admin";
import { requireAdmin } from "@/lib/server/admin-auth";
import {
  adminList,
  deleteAdminResource,
  updateInventory,
  updateOrderStatus,
  upsertInfluencer,
  upsertCatalogProduct,
  upsertShippingZone,
  upsertVariant,
} from "@/lib/server/admin-service";
import { AppError } from "@/lib/server/errors";
import { handleInfluencerMedia, handleMedia } from "@/lib/server/media-service";
import {
  errorResponse,
  jsonResponse,
  parseJsonBody,
} from "@/lib/server/http";
import {
  assertRateLimit,
  assertTrustedOrigin,
} from "@/lib/server/security";

export const dynamic = "force-dynamic";

async function resourceFrom(
  context: { params: Promise<{ resource: string }> },
) {
  const parsed = adminResourceSchema.safeParse((await context.params).resource);
  if (!parsed.success) {
    throw new AppError(404, "admin_resource_not_found", "Recurso no encontrado.");
  }
  return parsed.data;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ resource: string }> },
): Promise<Response> {
  try {
    assertRateLimit(request, "admin-api", 120, 60_000);
    const resource = await resourceFrom(context);
    await requireAdmin(
      request,
      resource === "audit" ? ["OWNER", "MANAGER"] : undefined,
    );
    return jsonResponse({ data: await adminList(resource) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ resource: string }> },
): Promise<Response> {
  try {
    assertTrustedOrigin(request);
    assertRateLimit(request, "admin-api-mutation", 60, 60_000);
    const resource = await resourceFrom(context);
    const principal = await requireAdmin(
      request,
      resource === "inventory" || resource === "orders"
        ? ["OWNER", "MANAGER", "FULFILLMENT"]
        : ["OWNER", "MANAGER"],
    );

    let data: unknown;
    if (resource === "dashboard" || resource === "audit") {
      throw new AppError(405, "admin_resource_read_only", "Recurso de solo lectura.");
    } else if (resource === "catalog") {
      data = await upsertCatalogProduct(
        principal,
        await parseJsonBody(request, catalogProductUpsertSchema),
      );
    } else if (resource === "inventory") {
      data = await updateInventory(
        principal,
        await parseJsonBody(request, inventoryUpdateSchema),
      );
    } else if (resource === "shipping-zones") {
      data = await upsertShippingZone(
        principal,
        await parseJsonBody(request, shippingZoneUpsertSchema),
      );
    } else if (resource === "orders") {
      data = await updateOrderStatus(
        principal,
        await parseJsonBody(request, orderStatusUpdateSchema),
      );
    } else if (resource === "media") {
      data = await handleMedia(
        principal,
        await parseJsonBody(request, mediaRequestSchema),
      );
    } else if (resource === "influencers") {
      data = await upsertInfluencer(
        principal,
        await parseJsonBody(request, influencerUpsertSchema),
      );
    } else if (resource === "influencer-media") {
      data = await handleInfluencerMedia(
        principal,
        await parseJsonBody(request, influencerMediaRequestSchema),
      );
    } else {
      data = await upsertVariant(principal, await parseJsonBody(request, variantUpsertSchema));
    }
    return jsonResponse({ data });
  } catch (error) {
    return errorResponse(error);
  }
}

export const PATCH = POST;

export async function DELETE(
  request: Request,
  context: { params: Promise<{ resource: string }> },
): Promise<Response> {
  try {
    assertTrustedOrigin(request);
    assertRateLimit(request, "admin-api-delete", 30, 60_000);
    const resource = await resourceFrom(context);
    if (!["catalog", "media", "influencers", "influencer-media"].includes(resource)) {
      throw new AppError(405, "delete_not_allowed", "Este recurso no admite eliminación.");
    }
    const principal = await requireAdmin(request, ["OWNER", "MANAGER"]);
    const parsed = adminDeleteSchema.safeParse({
      id: new URL(request.url).searchParams.get("id"),
    });
    if (!parsed.success) {
      throw new AppError(422, "invalid_admin_delete", "Identificador inválido.");
    }
    return jsonResponse({
      data: await deleteAdminResource(principal, resource, parsed.data.id),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
