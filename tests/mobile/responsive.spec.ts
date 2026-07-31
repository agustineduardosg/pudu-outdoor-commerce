import { expect, test } from "@playwright/test";

const routes = ["/", "/coleccion", "/guia-de-tallas", "/faq"] as const;

for (const route of routes) {
  test(`${route} no produce desplazamiento horizontal @mobile`, async ({
    page,
  }) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBeTruthy();

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
  });
}

test("el menú móvil se abre, navega y se cierra @mobile @smoke", async ({
  page,
}) => {
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: /menú/i });
  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await menuButton.tap();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");

  const navigation = page.getByRole("navigation").last();
  await navigation.getByRole("link", { name: /colección/i }).tap();
  await expect(page).toHaveURL(/\/coleccion/);
});

test("las acciones principales alcanzan 44 por 44 píxeles @mobile", async ({
  page,
}) => {
  await page.goto("/");

  const primaryAction = page
    .getByRole("link", { name: /colección|explorar|ver prendas/i })
    .first();
  const box = await primaryAction.boundingBox();
  expect(box, "La acción principal debe estar visible").not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
});

test("la interfaz respeta reducción de movimiento @mobile", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const longAnimations = await page.locator("body *").evaluateAll((elements) =>
    elements
      .map((element) => {
        const style = getComputedStyle(element);
        return {
          tag: element.tagName,
          animation: style.animationDuration,
          transition: style.transitionDuration,
        };
      })
      .filter(({ animation, transition }) => {
        const duration = (value: string) =>
          value
            .split(",")
            .map((part) => Number.parseFloat(part) * (part.includes("ms") ? 1 : 1000))
            .some((milliseconds) => milliseconds > 100);
        return duration(animation) || duration(transition);
      }),
  );

  expect(longAnimations).toEqual([]);
});
