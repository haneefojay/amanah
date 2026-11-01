import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers/a11y";
import { hasBackend, needsBackend } from "./helpers/backend";

test.skip(!hasBackend, needsBackend);

/** F2.1: public campaign list. Runs on the mobile (Pixel 7) and desktop projects. */

test.describe("Campaign list (F2.1)", () => {
  test("lists campaigns with their funding state", async ({ page }) => {
    await page.goto("/campaigns");
    await expect(page.getByRole("heading", { level: 1, name: "Campaigns" })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("9 campaigns");
    const cards = page.getByRole("region", { name: "Campaigns" }).getByRole("article");
    await expect(cards).toHaveCount(6);
    await expect(page.getByRole("article", { name: "Ramadan food drive" })).toContainText(
      "₦200,000 to go",
    );
    await expect(page.getByText("Page 1 of 2")).toBeVisible();
  });

  test("filters by city, keeps the filter in the address and after a reload", async ({ page }) => {
    await page.goto("/campaigns");
    await page.getByLabel("City").selectOption("Offa");
    await expect(page).toHaveURL(/\/campaigns\?city=Offa$/);
    const cards = page.getByRole("region", { name: "Campaigns" }).getByRole("article");
    await expect(cards).toHaveCount(4);
    await expect(page.getByRole("status")).toContainText("4 campaigns");
    await page.reload();
    await expect(page.getByLabel("City")).toHaveValue("Offa");
    await expect(cards).toHaveCount(4);
  });

  test("moves to the next page and back", async ({ page }) => {
    await page.goto("/campaigns");
    await page.getByRole("link", { name: /Next/ }).click();
    await expect(page).toHaveURL(/page=2$/);
    await expect(page.getByText("Page 2 of 2")).toBeVisible();
    await expect(page.getByRole("region", { name: "Campaigns" }).getByRole("article")).toHaveCount(
      3,
    );
    await page.getByRole("link", { name: /Previous/ }).click();
    await expect(page.getByText("Page 1 of 2")).toBeVisible();
  });

  test("does not scroll sideways at 360px or 1440px", async ({ page }) => {
    for (const width of [360, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/campaigns");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });

  test("Give now and Browse campaigns lead here from the landing page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Browse campaigns" }).first().click();
    await expect(page).toHaveURL(/\/campaigns$/);
  });

  test("has no automatically detectable accessibility violations", async ({ page }) => {
    await page.goto("/campaigns");
    await expect(page.getByText("live or recently completed")).toBeVisible();
    await expectNoA11yViolations(page);
  });
});

test.describe("Campaign page (F2.3)", () => {
  test("opens a campaign from the list and shows its story, funding and items", async ({
    page,
  }) => {
    await page.goto("/campaigns");
    await page.getByRole("link", { name: /Give to this campaign\s*: Ramadan food drive/ }).click();
    await expect(page).toHaveURL(/\/campaigns\/ramadan-food-drive-offa$/);
    await expect(page.getByRole("heading", { level: 1, name: "Ramadan food drive" })).toBeVisible();
    const funding = page.getByRole("region", { name: "Funding" });
    await expect(funding).toContainText("₦300,000");
    await expect(funding).toContainText("of a ₦500,000 target");
    await expect(funding.getByRole("button", { name: /Give to this campaign/ })).toBeVisible();
    // The table shows from 640px and the list below it, so check whichever is visible.
    await expect(page.locator('text="Total, equal to the target" >> visible=true')).toBeVisible();
    await page.getByRole("link", { name: "All campaigns" }).click();
    await expect(page).toHaveURL(/\/campaigns$/);
  });

  test("a funded campaign is closed to donations but can be shared", async ({ page }) => {
    await page.goto("/campaigns/borehole-islamiyya-school");
    const funding = page.getByRole("region", { name: "Funding" });
    await expect(funding.getByText("Target reached. Donations closed.")).toBeVisible();
    await expect(funding.getByRole("button", { name: /Give to this campaign/ })).toHaveCount(0);
    await expect(funding.getByRole("button", { name: "Share this campaign" })).toBeVisible();
  });

  test("an unknown or draft campaign shows not found and is kept out of search", async ({
    page,
  }) => {
    for (const slug of ["no-such-campaign", "draft-campaign"]) {
      await page.goto(`/campaigns/${slug}`);
      await expect(
        page.getByRole("heading", { name: "We couldn’t find that campaign" }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Browse campaigns" }).first()).toBeVisible();
      await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    }
  });

  test("copies the link where the phone share sheet is missing", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => undefined);
    await page.goto("/campaigns/ramadan-food-drive-offa");
    await page.evaluate(() => Object.defineProperty(navigator, "share", { value: undefined }));
    await page.getByRole("button", { name: "Share this campaign" }).click();
    await expect(page.getByText("Campaign link copied. Paste it anywhere to share.")).toBeVisible();
  });

  test("does not scroll sideways at 360px, 980px or 1440px, even with a very long title", async ({
    page,
  }) => {
    for (const slug of ["ramadan-food-drive-offa", "mosque-roof-repair-oke-ode"]) {
      for (const width of [360, 980, 1440]) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`/campaigns/${slug}`);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${slug} at ${width}px`).toBeLessThanOrEqual(0);
      }
    }
  });

  test("has no automatically detectable accessibility violations", async ({ page }) => {
    for (const slug of ["ramadan-food-drive-offa", "borehole-islamiyya-school"]) {
      await page.goto(`/campaigns/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoA11yViolations(page);
    }
  });
});

test.describe("Organisation profile (F2.4)", () => {
  test("goes from a campaign page to its organisation and back to a campaign", async ({ page }) => {
    await page.goto("/campaigns/ramadan-food-drive-offa");
    await page.getByRole("link", { name: "View organisation" }).click();
    await expect(page).toHaveURL(/\/organisations\/8f2a1c3d-4b5e-4f60-8a7b-9c0d1e2f3a41$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Central Mosque, Offa" }),
    ).toBeVisible();
    await expect(page.getByText("12 Station Road, Offa, Kwara State")).toBeVisible();
    await expect(page.getByText(/registration number/i)).toHaveCount(0);
    const cards = page.getByRole("region", { name: "Campaigns" }).getByRole("article");
    await expect(cards).toHaveCount(4);
    await page.getByRole("button", { name: /^Past/ }).click();
    await expect(cards).toHaveCount(2);
    await page.getByRole("button", { name: /^All/ }).click();
    await page.getByRole("link", { name: /Give to this campaign\s*: Ramadan food drive/ }).click();
    await expect(page).toHaveURL(/\/campaigns\/ramadan-food-drive-offa$/);
  });

  test("an unknown organisation shows not found", async ({ page }) => {
    await page.goto("/organisations/8f2a1c3d-4b5e-4f60-8a7b-000000000000");
    await expect(
      page.getByRole("heading", { name: "We couldn’t find that organisation" }),
    ).toBeVisible();
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("does not scroll sideways at 360px, 980px or 1440px", async ({ page }) => {
    for (const width of [360, 980, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/organisations/8f2a1c3d-4b5e-4f60-8a7b-9c0d1e2f3a43");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test("has no automatically detectable accessibility violations", async ({ page }) => {
    await page.goto("/organisations/8f2a1c3d-4b5e-4f60-8a7b-9c0d1e2f3a41");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoA11yViolations(page);
  });
});
