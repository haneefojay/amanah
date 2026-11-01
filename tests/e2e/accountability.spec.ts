import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers/a11y";
import { hasBackend, needsBackend } from "./helpers/backend";

test.skip(!hasBackend, needsBackend);

/** F3: the accountability section of the campaign page. Runs on the mobile and desktop projects. */

test.describe("Items and witness confirmation (F3.2)", () => {
  test("shows who confirmed a delivery and a dispute with its comment", async ({ page }) => {
    await page.goto("/campaigns/school-supplies-40-orphans");
    await expect(
      page.locator('text="Confirmed by Alhaja Rukayat Adebayo" >> visible=true').first(),
    ).toBeVisible();
    await expect(
      page.locator('text="Disputed by Alhaja Rukayat Adebayo" >> visible=true'),
    ).toBeVisible();
    await expect(page.locator("text=/Only 24 of the 30 bags/ >> visible=true")).toBeVisible();
    await expectNoA11yViolations(page);
  });
});

test.describe("Expenses and receipts (F3.3)", () => {
  test("opens a receipt full size and closes it with Escape", async ({ page }) => {
    await page.goto("/campaigns/ramadan-food-drive-offa");
    const section = page.getByRole("region", { name: "Where the money went" });
    await expect(section.getByRole("heading", { name: "Expenses" })).toBeVisible();
    await expect(section.locator('text="Total spent" >> visible=true')).toBeVisible();
    const thumbnail = section
      .getByRole("button", { name: "View the receipt for Rice, 5 bags of 50 kg" })
      .locator("visible=true");
    await thumbnail.click();
    const dialog = page.getByRole("dialog", { name: "Receipt: Rice, 5 bags of 50 kg" });
    await expect(dialog).toBeVisible();
    const receipt = dialog.getByRole("img", { name: /Receipt from Musa & Sons Grains/ });
    await expect(receipt).toBeVisible();
    await expect
      .poll(() => receipt.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    await expectNoA11yViolations(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(thumbnail).toBeFocused();
  });

  test("shows the empty state when nothing has been spent", async ({ page }) => {
    await page.goto("/campaigns/quran-learning-materials");
    await expect(
      page.getByText("No spending yet. Each purchase will appear here with its receipt."),
    ).toBeVisible();
  });
});

test.describe("Evidence gallery (F3.4)", () => {
  test("shows photos with the recorded upload time, the phone time and the location", async ({
    page,
  }) => {
    await page.goto("/campaigns/ramadan-food-drive-offa");
    const gallery = page.getByRole("region", { name: "Photos from the ground" });
    const photo = gallery.getByRole("img", { name: "Photo for Rice, 50 kg bags" });
    await photo.scrollIntoViewIfNeeded();
    await expect
      .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    await expect(gallery).toContainText("14 Oct 2026, 4:42 pm");
    await expect(gallery).toContainText("Recorded by Amanah");
    await expect(gallery).toContainText("14 Oct 2026, 4:05 pm");
    await expect(gallery.getByRole("link", { name: /8\.14921, 4\.72036/ })).toHaveAttribute(
      "href",
      /openstreetmap\.org/,
    );
  });

  test("says when a photo has no location", async ({ page }) => {
    await page.goto("/campaigns/eid-clothes-30-children");
    await expect(
      page
        .getByRole("region", { name: "Photos from the ground" })
        .getByText("Location unavailable"),
    ).toBeVisible();
  });
});

test.describe("Spent and held (F3.5)", () => {
  test("splits the amount raised into spent and held, matching the expenses", async ({ page }) => {
    await page.goto("/campaigns/ramadan-food-drive-offa");
    const split = page.getByRole("region", { name: "Spent and held" });
    await expect(split).toContainText("Of ₦300,000 raised so far");
    await expect(
      split.getByRole("img", { name: "₦280,000 spent and ₦20,000 held, of ₦300,000 raised" }),
    ).toBeVisible();
    await expect(page.locator('text="Total spent" >> visible=true')).toBeVisible();
    await expect(page.locator("text=/^₦280,000$/ >> visible=true").first()).toBeVisible();
  });

  test("does not scroll sideways at 360px with the whole section", async ({ page }) => {
    for (const slug of ["ramadan-food-drive-offa", "school-supplies-40-orphans"]) {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(`/campaigns/${slug}`);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, slug).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("Live refresh (F3.7)", () => {
  // Requests that go through the service worker can't be intercepted, so this test blocks it.
  // The worker passes /api/* straight to the network anyway (NetworkOnly, ADR-002).
  test.use({ serviceWorkers: "block" });

  test("the page shows a new gift without a reload", async ({ page }) => {
    // The server renders the page; afterwards the browser polls the API. Simulate a donation
    // confirmed elsewhere by changing what the poll returns.
    await page.route("**/api/campaigns/ramadan-food-drive-offa", async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.data.raisedAmount = 35_000_000;
      body.data.availableAmount = 15_000_000;
      await route.fulfill({ response, json: body });
    });
    await page.goto("/campaigns/ramadan-food-drive-offa");
    const funding = page.getByRole("region", { name: "Funding" });
    await expect(funding).toContainText("₦300,000");
    await expect(page.getByRole("status").filter({ hasText: "Updated just now" })).toBeVisible();
    await expect(funding).toContainText("₦350,000", { timeout: 25_000 });
    await expect(funding).toContainText("Up to ₦150,000 can be given");
    await expect(page.getByRole("region", { name: "Spent and held" })).toContainText(
      "Of ₦350,000 raised so far",
    );
  });
});

test.describe("Updates timeline (F3.6)", () => {
  test("shows the organisation's updates, newest first", async ({ page }) => {
    await page.goto("/campaigns/ramadan-food-drive-offa");
    const posts = page
      .getByRole("region", { name: "Updates from the organisation" })
      .getByRole("article");
    await expect(posts).toHaveCount(2);
    await expect(posts.first()).toContainText("14 October 2026");
    await expect(posts.first()).toContainText("The rice has arrived at the mosque store.");
  });

  test("the whole accountability section is accessible", async ({ page }) => {
    for (const slug of ["ramadan-food-drive-offa", "quran-learning-materials"]) {
      await page.goto(`/campaigns/${slug}`);
      await page.getByRole("region", { name: "Where the money went" }).scrollIntoViewIfNeeded();
      await expectNoA11yViolations(page);
    }
  });
});
