import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;
// Optional: point at a preinstalled Chromium (e.g. in CI images) instead of `npx playwright install`.
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

/**
 * End-to-end tests run against a production build, because the service worker (PWA) is only
 * active in production. Mobile is the primary target (spec §9).
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "on-first-retry", launchOptions: { executablePath } },
  projects: [
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    { name: "desktop-chrome", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: `npm run build && npm run start -- --port ${PORT}`,
      url: baseURL,
      timeout: 240_000,
      reuseExistingServer: !process.env.CI,
      env: { NEXT_PUBLIC_APP_URL: baseURL },
    },
  ],
});
