import { describe, expect, it } from "vitest";
import { checkoutSchema } from "@/lib/schemas/checkout";
import { mercadoPagoWebhookSchema } from "@/lib/schemas/webhook";
import {
  influencerMediaRequestSchema,
  influencerUpsertSchema,
} from "@/lib/schemas/admin";

const validCheckout = {
  items: [{ sku: "PUD-SHV-001-M", quantity: 1 }],
  customer: {
    email: "comprador@example.com",
    firstName: "Pudú",
    lastName: "Prueba",
    phone: "+56912345678",
  },
  shipping: {
    zoneCode: "RM",
    addressLine1: "Dirección 123",
    addressLine2: "",
    commune: "Santiago",
    region: "Metropolitana",
    postalCode: "",
    instructions: "",
  },
};

describe("contrato de checkout", () => {
  it("acepta SKU y cantidad, sin precio aportado por el navegador", () => {
    expect(checkoutSchema.safeParse(validCheckout).success).toBe(true);
  });

  it("rechaza campos de precio y cantidades fuera de rango", () => {
    expect(
      checkoutSchema.safeParse({
        ...validCheckout,
        items: [{ sku: "PUD-SHV-001-M", quantity: 99, price: 1 }],
      }).success,
    ).toBe(false);
  });
});

describe("contrato de webhook", () => {
  it("normaliza identificadores del proveedor a texto", () => {
    const result = mercadoPagoWebhookSchema.parse({
      id: 123,
      live_mode: false,
      type: "payment",
      action: "payment.updated",
      data: { id: 456 },
    });
    expect(result.id).toBe("123");
    expect(result.data.id).toBe("456");
  });
});

describe("contratos del archivo de embajadores", () => {
  it("acepta un perfil editorial completo", () => {
    expect(
      influencerUpsertSchema.safeParse({
        slug: "maite",
        displayName: "Maite",
        legalName: null,
        pronouns: null,
        bio: "Primera embajadora oficial de PUDU para campañas de montaña.",
        location: "Chile",
        email: null,
        instagramHandle: "maite.pudu",
        status: "ACTIVE",
        featured: true,
        sortOrder: 0,
      }).success,
    ).toBe(true);
  });

  it("rechaza formatos activos y cargas mayores a 8 MB", () => {
    expect(
      influencerMediaRequestSchema.safeParse({
        action: "presign",
        influencerId: "9e3a28fe-8976-4a7c-9f59-7c849f3cf43a",
        fileName: "perfil.svg",
        contentType: "image/svg+xml",
        size: 9 * 1024 * 1024,
      }).success,
    ).toBe(false);
  });
});
