import { expect, test } from "@playwright/test";

function productsFrom(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== "object") return [];
  const record = body as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.products)) return record.products;
  return [];
}

test.describe("Contratos API públicos", () => {
  test("liveness confirma que el proceso está disponible @smoke", async ({
    request,
  }) => {
    const response = await request.get("/api/health/live");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(await response.json()).toMatchObject({ status: "ok" });
  });

  test("readiness confirma dependencias listas @critical", async ({
    request,
  }) => {
    const response = await request.get("/api/health/ready");
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ status: "ready" });
  });

  test("el catálogo entrega ocho productos activos con precios CLP enteros", async ({
    request,
  }) => {
    const response = await request.get("/api/v1/products");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");

    const products = productsFrom(await response.json());
    expect(products).toHaveLength(8);

    for (const value of products) {
      expect(value).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          slug: expect.any(String),
          name: expect.any(String),
          priceClp: expect.any(Number),
        }),
      );
      expect(Number.isInteger((value as { priceClp: number }).priceClp)).toBe(
        true,
      );
      expect((value as { priceClp: number }).priceClp).toBeGreaterThan(0);
    }
  });

  test("la ficha por slug coincide con el catálogo", async ({ request }) => {
    const listResponse = await request.get("/api/v1/products");
    const products = productsFrom(await listResponse.json()) as Array<{
      slug: string;
    }>;
    expect(products.length).toBeGreaterThan(0);

    const response = await request.get(
      `/api/v1/products/${encodeURIComponent(products[0].slug)}`,
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    const product =
      body && typeof body === "object" && "data" in body ? body.data : body;
    expect(product).toEqual(
      expect.objectContaining({ slug: products[0].slug }),
    );
  });

  test("checkout rechaza cuerpos inválidos con Problem Details", async ({
    request,
  }) => {
    const response = await request.post("/api/v1/checkout", {
      headers: {
        Origin:
          process.env.APP_ORIGIN ??
          process.env.BASE_URL ??
          "http://127.0.0.1:3000",
      },
      data: {
        items: [{ sku: "", quantity: 0, price: 1 }],
        customer: { email: "no-es-email" },
      },
    });

    expect([400, 422]).toContain(response.status());
    expect(response.headers()["content-type"]).toContain(
      "application/problem+json",
    );
    expect(await response.json()).toEqual(
      expect.objectContaining({
        type: expect.any(String),
        title: expect.any(String),
        status: response.status(),
      }),
    );
  });

  test("estado de pedido no filtra información sin token público", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/v1/orders/00000000-0000-4000-8000-000000000000/status",
    );
    expect([401, 403, 404]).toContain(response.status());
  });
});
