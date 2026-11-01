import { test } from "@playwright/test";
import { hasBackend, needsBackend } from "./helpers/backend";

test.skip(!hasBackend, needsBackend);

/**
 * Full-page screenshots of the landing page for documents and PR reviews.
 * Skipped in normal runs. Generate with: npm run screenshots (writes to ./screenshots).
 */
test.describe("Landing page screenshots", () => {
  test.skip(!process.env.SCREENSHOTS, "Set SCREENSHOTS=1 to generate screenshots");

  for (const [name, width, scale] of [
    ["mobile", 390, 3],
    ["desktop", 1440, 2],
  ] as const) {
    test(`landing-${name}`, async ({ browser }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop-chrome", "Generate each shot once");
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        deviceScaleFactor: scale,
      });
      await page.goto("/", { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `screenshots/landing-${name}.png`, fullPage: true });
      await page.screenshot({ path: `screenshots/landing-${name}-first-screen.png` });
      await page.close();
    });
  }
});
