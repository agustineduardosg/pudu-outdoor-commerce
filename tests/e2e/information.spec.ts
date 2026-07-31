import { expect, test } from "@playwright/test";

const publicInformationRoutes = [
  ["/guia-de-tallas", /guía.*tallas|encuentra.*talla/i],
  ["/envios-y-devoluciones", /envíos|despacho|devoluciones/i],
  ["/faq", /preguntas|frecuentes/i],
  ["/contacto", /contacto|hablemos/i],
  ["/privacidad", /privacidad/i],
  ["/terminos", /términos/i],
] as const;

for (const [path, title] of publicInformationRoutes) {
  test(`${path} es pública y tiene contenido identificable @smoke`, async ({
    page,
  }) => {
    const response = await page.goto(path);

    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(title);
    await expect(page.getByRole("main")).toBeVisible();
  });
}
