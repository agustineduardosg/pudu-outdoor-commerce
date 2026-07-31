import { expect, test } from "@playwright/test";

test.describe("Controles de seguridad visibles", () => {
  test("la aplicación entrega headers de defensa en profundidad @critical", async ({
    page,
  }) => {
    const response = await page.goto("/");
    const headers = response?.headers() ?? {};

    expect(headers["content-security-policy"]).toBeTruthy();
    if (process.env.CI || process.env.TEST_PRODUCTION === "1") {
      expect(headers["content-security-policy"]).not.toContain("'unsafe-eval'");
    }
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBeTruthy();
    expect(headers["permissions-policy"]).toBeTruthy();
    expect(
      headers["x-frame-options"] === "DENY" ||
        headers["content-security-policy"]?.includes("frame-ancestors"),
    ).toBe(true);

    if (!page.url().includes("localhost") && !page.url().includes("127.0.0.1")) {
      expect(headers["strict-transport-security"]).toBeTruthy();
    }
  });

  test("el panel administrativo exige autenticación @critical", async ({
    page,
  }) => {
    const response = await page.goto("/admin");
    const path = new URL(page.url()).pathname;
    const loginHeading = page.getByRole("heading", {
      name: /iniciar sesión|acceso administrador|acceso privado/i,
    });
    await expect(loginHeading).toBeVisible();

    expect(
      path.startsWith("/admin/login") ||
        path.startsWith("/login") ||
        (await loginHeading.isVisible()) ||
        [401, 403].includes(response?.status() ?? 0),
    ).toBe(true);
  });

  test("rutas sensibles no admiten caché compartida", async ({ request }) => {
    const response = await request.get("/admin");
    const cacheControl = response.headers()["cache-control"] ?? "";
    expect(cacheControl).toMatch(
      process.env.CI || process.env.TEST_PRODUCTION === "1"
        ? /no-store|private/
        : /no-store|private|no-cache/,
    );
  });

  test("CORS no refleja orígenes arbitrarios", async ({ request }) => {
    const response = await request.get("/api/v1/products", {
      headers: { Origin: "https://atacante.example" },
    });
    expect(response.headers()["access-control-allow-origin"]).not.toBe(
      "https://atacante.example",
    );
  });

  test("un webhook sin firma válida nunca se procesa @critical", async ({
    request,
  }) => {
    const response = await request.post("/api/webhooks/mercadopago", {
      headers: {
        "content-type": "application/json",
        "x-signature": "ts=1,v1=invalida",
        "x-request-id": "qa-invalid-signature",
      },
      data: { action: "payment.updated", data: { id: "123" } },
    });

    expect([400, 401, 403]).toContain(response.status());
  });

  test("texto hostil en URL no ejecuta JavaScript", async ({ page }) => {
    let dialogOpened = false;
    page.on("dialog", async (dialog) => {
      dialogOpened = true;
      await dialog.dismiss();
    });

    const payload = '<img src=x onerror="alert(1)">';
    const response = await page.goto(`/?q=${encodeURIComponent(payload)}`);

    expect(response?.ok()).toBeTruthy();
    expect(dialogOpened).toBe(false);
    expect(await page.content()).not.toContain(payload);
  });
});
