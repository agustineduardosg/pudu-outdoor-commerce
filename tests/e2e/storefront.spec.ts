import { expect, test } from "@playwright/test";

test.describe("Tienda pública PUDU", () => {
  test("la portada comunica la marca y ofrece una ruta clara a la colección @smoke", async ({
    page,
  }) => {
    const response = await page.goto("/");

    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(/PUDU/i);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /PUDU.*inicio/i })).toBeVisible();
    await expect(page.getByRole("navigation").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /colección|explorar|ver prendas/i }).first(),
    ).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("la colección expone solo prendas con branding PUDU @critical", async ({
    page,
  }) => {
    const response = await page.goto("/coleccion");

    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("main")).toContainText(/colección/i);

    const productLinks = page.locator('a[href^="/producto/"]');
    await expect(productLinks.first()).toBeVisible();

    const uniqueProducts = await productLinks.evaluateAll((links) =>
      Array.from(
        new Set(
          links
            .map((link) => link.getAttribute("href"))
            .filter((href): href is string => Boolean(href)),
        ),
      ),
    );
    expect(uniqueProducts).toHaveLength(2);
  });

  test("una ficha distingue claramente lanzamiento futuro y venta disponible @critical", async ({
    page,
  }) => {
    await page.goto("/coleccion");
    const productHref = await page
      .locator('a[href^="/producto/"]')
      .first()
      .getAttribute("href");

    expect(productHref).toBeTruthy();
    await page.goto(productHref!);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/\$\s?[\d.]+/).first()).toBeVisible();

    const sizeSelect = page.getByRole("combobox", { name: /talla/i });
    if (await sizeSelect.isVisible()) {
      await sizeSelect.selectOption({ index: 1 });
    } else {
      await page
        .getByRole("group", { name: /talla/i })
        .getByRole("button")
        .first()
        .click();
    }

    const colorSelect = page.getByRole("combobox", { name: /color/i });
    if (await colorSelect.isVisible()) {
      await colorSelect.selectOption({ index: 1 });
    } else {
      const colorGroup = page.getByRole("group", { name: /color/i });
      if (await colorGroup.isVisible()) {
        await colorGroup.getByRole("radio").first().check();
      }
    }

    const launchLink = page.getByRole("link", {
      name: /avísame.*lanzamiento/i,
    });
    if (await launchLink.isVisible()) {
      await expect(page.getByText(/próximamente/i).first()).toBeVisible();
      await expect(launchLink).toHaveAttribute("href", /\/contacto\?interes=/);
      return;
    }

    await page
      .getByRole("button", { name: /agregar|añadir.*carrito/i })
      .click();
    await expect(page.locator(".purchase-message")).toContainText(
      /carrito|agregad/i,
    );

    await page.reload();
    await page.getByRole("link", { name: /carrito/i }).click();
    await expect(page).toHaveURL(/\/carrito/);
    await expect(page.getByRole("main")).toContainText(/subtotal/i);
    await expect(
      page.getByRole("link", { name: /finalizar|checkout|continuar/i }),
    ).toBeVisible();
  });
});
