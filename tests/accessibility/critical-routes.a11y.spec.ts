import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/coleccion",
  "/guia-de-tallas",
  "/envios-y-devoluciones",
  "/faq",
] as const;

for (const route of routes) {
  test(`${route} no tiene infracciones críticas o serias WCAG @a11y`, async ({
    page,
  }, testInfo) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBeTruthy();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter(
      ({ impact }) => impact === "critical" || impact === "serious",
    );

    if (blocking.length > 0) {
      await testInfo.attach("axe-violations.json", {
        body: Buffer.from(JSON.stringify(blocking, null, 2)),
        contentType: "application/json",
      });
    }

    expect(
      blocking,
      blocking
        .map(
          ({ id, impact, help, nodes }) =>
            `[${impact}] ${id}: ${help} (${nodes.length} nodos)`,
        )
        .join("\n"),
    ).toEqual([]);
  });
}

test("el enlace de salto mueve el foco al contenido principal @a11y", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", {
    name: /saltar.*contenido|ir.*contenido/i,
  });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("la navegación móvil conserva foco y cierre con Escape @a11y", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const trigger = page.getByRole("button", { name: /menú/i });
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});
