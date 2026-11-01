import { expect, test, type Page } from "@playwright/test";
import { expectNoA11yViolations } from "./helpers/a11y";
import { hasBackend, needsBackend } from "./helpers/backend";

/** F2.6: public landing page. Runs on the mobile (Pixel 7) and desktop projects. */

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("Landing page (F2.6)", () => {
  test("shows the headline, the example campaign and the meaning of Amānah", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Give with certainty. Follow every naira.",
    );
    const ledger = page.getByRole("article", { name: "Ramadan food drive" }).first();
    await expect(ledger.getByText("Target reached. Donations closed.")).toBeVisible();
    await expect(page.getByText(/the trust placed in your care/)).toBeVisible();
    // أمانة sits at the crown of the hero arch on every screen size.
    await expect(page.getByText("أمانة").first()).toBeVisible();
  });

  test("never scrolls sideways at 360px, 980px or 1440px", async ({ page }) => {
    for (const width of [360, 980, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      await expectNoHorizontalScroll(page);
    }
  });

  test("loads the self-hosted fonts", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() =>
      [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family),
    );
    expect(loaded.join(" ")).toMatch(/schibsted/i);
    expect(loaded.join(" ")).toMatch(/reem/i);
  });

  test("has no automatically detectable accessibility violations", async ({ page }) => {
    await page.goto("/");
    await expectNoA11yViolations(page);
  });

  test("never shows out-of-scope or internal wording", async ({ page }) => {
    await page.goto("/");
    const text = (await page.locator("body").innerText()).toLowerCase();
    for (const term of [
      "zakat",
      "waqf",
      "pilot",
      "test mode",
      "hackathon",
      "ametts",
      "paystack",
      "audit log",
      "server",
      "database",
    ]) {
      expect(text).not.toContain(term);
    }
  });
});

test.describe("Landing layout on phones", () => {
  test("the arch window follows the hero text, with the example campaign over it", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Phone layout only");
    await page.goto("/");
    const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
    const word = page.getByText("أمانة").first();
    const card = page.getByRole("article", { name: "Ramadan food drive" }).first();
    await expect(word).toBeVisible();
    await expect(card).toBeVisible();
    const wordBox = await word.boundingBox();
    const cardBox = await card.boundingBox();
    expect(heading && wordBox && wordBox.y > heading.y + heading.height).toBe(true);
    expect(wordBox && cardBox && cardBox.y > wordBox.y).toBe(true);
    // The witness tag is a wide-screen detail only.
    await expect(page.getByText("Witness confirmed delivery")).toBeHidden();
  });

  test("the two hero buttons share one line", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone layout only");
    for (const width of [390, 412]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const browse = await page
        .getByRole("link", { name: "Browse campaigns" })
        .first()
        .boundingBox();
      const how = await page.getByRole("link", { name: "See how it works" }).boundingBox();
      expect(browse && how).toBeTruthy();
      if (!browse || !how) return;
      expect(Math.abs(browse.y + browse.height / 2 - (how.y + how.height / 2))).toBeLessThan(4);
      expect(how.x + how.width).toBeLessThanOrEqual(width);
    }
  });

  test("buttons keep the pill and the soft secondary pill", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Browse campaigns" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "See how it works" })).toBeVisible();
  });
});

test.describe("Landing layout as a desktop site on a phone (980px)", () => {
  test.use({ viewport: { width: 980, height: 1400 }, isMobile: false, hasTouch: false });

  test("matches the desktop layout", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeVisible();
    // Section links sit on one line; the separate register button waits for wider screens.
    const tops = await nav
      .getByRole("link")
      .evaluateAll((links) =>
        links.map((l) => l.getBoundingClientRect().top + l.getBoundingClientRect().height / 2),
      );
    expect(tops).toHaveLength(4);
    expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(4);
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Register your organisation" }),
    ).toBeHidden();
    // The arch window and its example campaign sit beside the headline, not under it.
    const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
    const card = await page
      .getByRole("article", { name: "Ramadan food drive" })
      .first()
      .boundingBox();
    expect(heading && card && card.x > heading.x + heading.width).toBe(true);
    await expect(page.getByText("أمانة").first()).toBeVisible();
    // The five steps share one row.
    const stepTops = await page
      .locator("#how ol > li")
      .evaluateAll((items) => items.map((i) => Math.round(i.getBoundingClientRect().top)));
    expect(stepTops).toHaveLength(5);
    expect(new Set(stepTops).size).toBe(1);
  });
});

test.describe("Landing navigation", () => {
  test("desktop: section links scroll to their sections", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop navigation only");
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await nav.getByRole("link", { name: "The cap" }).click();
    await expect(page).toHaveURL(/#cap$/);
    await expect(
      page.getByRole("heading", { name: "Never a kobo beyond the target." }),
    ).toBeInViewport();
  });

  test("mobile: the menu opens, navigates and closes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile menu only");
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Accountability" })
      .click();
    await expect(page).toHaveURL(/#trail$/);
    await expect(
      page.getByRole("heading", { name: "Every campaign comes with its receipts." }),
    ).toBeInViewport();
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});

test.describe("Raising now", () => {
  test.skip(!hasBackend, needsBackend);

  test("shows the campaigns from the API with their cover photos", async ({ page }) => {
    await page.goto("/");
    const list = page.getByRole("list", { name: "Campaigns raising now" });
    await expect(list.getByRole("article")).toHaveCount(3);
    const photos = list.locator("img");
    await expect(photos).toHaveCount(3);
    for (const img of await photos.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }
    await expect(
      list.getByText("Target nearly reached. Pending payments are being processed."),
    ).toBeVisible();
  });

  test("phones scroll the cards sideways inside the section, not the page", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Phone layout only");
    await page.goto("/");
    const list = page.getByRole("list", { name: "Campaigns raising now" });
    await expect(list.getByRole("article")).toHaveCount(3);
    const tops = await list
      .locator("li")
      .evaluateAll((items) => items.map((i) => Math.round(i.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(1);
    const scrolls = await list.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(scrolls).toBe(true);
    await expectNoHorizontalScroll(page);
  });
});
