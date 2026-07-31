import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    __puduCls: number;
    __puduLcp: number;
  }
}

test("la portada cumple presupuestos de experiencia y transferencia @performance", async ({
  page,
}, testInfo) => {
  test.skip(
    !process.env.CI && process.env.TEST_PRODUCTION !== "1",
    "Los presupuestos se miden únicamente sobre el build de producción.",
  );
  await page.addInitScript(() => {
    window.__puduCls = 0;
    window.__puduLcp = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<
        PerformanceEntry & { hadRecentInput?: boolean; value?: number }
      >) {
        if (!entry.hadRecentInput) window.__puduCls += entry.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) window.__puduLcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });

  const response = await page.goto("/", { waitUntil: "load" });
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const metrics = await page.evaluate(async () => {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];
    return {
      lcp: window.__puduLcp,
      cls: window.__puduCls,
      ttfb: navigation.responseStart - navigation.requestStart,
      totalBytes: resources.reduce(
        (sum, resource) => sum + (resource.transferSize || 0),
        0,
      ),
      javascriptBytes: resources
        .filter((resource) => resource.initiatorType === "script")
        .reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
      imageCount: resources.filter(
        (resource) => resource.initiatorType === "img",
      ).length,
    };
  });

  await testInfo.attach("performance-budget.json", {
    body: Buffer.from(JSON.stringify(metrics, null, 2)),
    contentType: "application/json",
  });

  expect(metrics.lcp, "Debe capturarse una entrada LCP").toBeGreaterThan(0);
  expect(metrics.lcp, "LCP debe ser menor o igual a 2,5 s").toBeLessThanOrEqual(
    2_500,
  );
  expect(metrics.cls, "CLS debe ser menor o igual a 0,1").toBeLessThanOrEqual(
    0.1,
  );
  expect(metrics.ttfb, "TTFB local debe ser menor a 800 ms").toBeLessThan(800);
  expect(metrics.totalBytes, "La portada no debe superar 3 MB").toBeLessThan(
    3_000_000,
  );
  expect(
    metrics.javascriptBytes,
    "JavaScript transferido no debe superar 600 KB",
  ).toBeLessThan(600_000);
  expect(metrics.imageCount).toBeLessThanOrEqual(20);
});
