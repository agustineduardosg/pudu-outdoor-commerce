import { defineConfig, devices, type Project } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const fullBrowserMatrix = process.env.PW_FULL_BROWSERS === "1";
const productionServer =
  Boolean(process.env.CI) || process.env.TEST_PRODUCTION === "1";

const projects: Project[] = [
  {
    name: "api",
    testMatch: /api\/.*\.spec\.ts/,
  },
  {
    name: "chromium",
    testMatch: /(e2e|security)\/.*\.spec\.ts/,
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "accessibility",
    testMatch: /accessibility\/.*\.spec\.ts/,
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "mobile-chrome",
    testMatch: /mobile\/.*\.spec\.ts/,
    use: { ...devices["Pixel 7"] },
  },
  {
    name: "performance",
    testMatch: /performance\/.*\.spec\.ts/,
    use: { ...devices["Desktop Chrome"] },
  },
];

if (fullBrowserMatrix) {
  projects.push(
    {
      name: "firefox",
      testMatch: /e2e\/storefront\.spec\.ts/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testMatch: /e2e\/storefront\.spec\.ts/,
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-safari",
      testMatch: /mobile\/.*\.spec\.ts/,
      use: { ...devices["iPhone 14"] },
    },
  );
}

export default defineConfig({
  testDir: "./tests",
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? "50%" : undefined,
  timeout: 30_000,
  expect: {
    timeout: 7_500,
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
    },
  },
  reporter: process.env.CI
    ? [
        ["github"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
        ["junit", { outputFile: "test-results/junit.xml" }],
      ]
    : [
        ["list"],
        ["html", { open: "on-failure", outputFolder: "playwright-report" }],
      ],
  use: {
    baseURL,
    locale: "es-CL",
    timezoneId: "America/Santiago",
    actionTimeout: 10_000,
    navigationTimeout: process.env.CI ? 30_000 : 15_000,
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
    screenshot: "only-on-failure",
    video: process.env.CI ? "retain-on-failure" : "off",
    testIdAttribute: "data-testid",
  },
  projects,
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: productionServer
          ? "npm run build && npm run start"
          : "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1",
        url: `${baseURL}/api/health/live`,
        reuseExistingServer: !process.env.CI && !productionServer,
        timeout: 180_000,
        stdout: "pipe",
        stderr: "pipe",
        env: {
          NODE_ENV: productionServer ? "production" : "test",
          APP_ORIGIN: process.env.APP_ORIGIN ?? baseURL,
          PUDU_DEMO_MODE:
            process.env.PUDU_DEMO_MODE ??
            (process.env.DATABASE_URL ? "false" : "true"),
          ...(process.env.DATABASE_URL
            ? { DATABASE_URL: process.env.DATABASE_URL }
            : {}),
        },
      },
});
