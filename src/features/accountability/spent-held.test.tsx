import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CampaignDetail } from "@/lib/api/schemas";
import { formatNaira } from "@/lib/money";
import { campaignDetails } from "@/test/fixtures";
import { expectNoA11yViolations } from "@/test/axe";
import { AccountabilitySection } from "./accountability-section";
import { SpentHeld } from "./spent-held";

const ramadan = campaignDetails["ramadan-food-drive-offa"]!;
const region = () => screen.getByRole("region", { name: "Spent and held" });
const figure = (label: RegExp) => within(region()).getByText(label).nextElementSibling;

describe("SpentHeld (F3.5)", () => {
  it("splits what was raised into spent and held (partial)", async () => {
    const { container } = render(<SpentHeld campaign={ramadan} />);
    expect(within(region()).getByText(/raised so far/)).toHaveTextContent(
      "Of ₦300,000 raised so far",
    );
    expect(
      within(region()).getByRole("img", {
        name: "₦280,000 spent and ₦20,000 held, of ₦300,000 raised",
      }),
    ).toBeInTheDocument();
    expect(figure(/^Spent · 93%$/)).toHaveTextContent("₦280,000");
    expect(figure(/^Held · 7%$/)).toHaveTextContent("₦20,000");
    expect(within(region()).getByText("On the 2 expenses listed below")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("shows 0% spent: everything is held", () => {
    render(<SpentHeld campaign={campaignDetails["quran-learning-materials"]!} />);
    expect(
      within(region()).getByRole("img", { name: "Nothing spent yet; ₦60,000 held" }),
    ).toBeInTheDocument();
    expect(region()).toHaveTextContent(
      "Nothing spent yet. All ₦60,000 is held by the organisation until the first purchase.",
    );
  });

  it("shows 100% spent: nothing is held", () => {
    render(<SpentHeld campaign={campaignDetails["clinic-medicines-ilorin"]!} />);
    expect(within(region()).getByText(/raised$/)).toHaveTextContent("Of ₦250,000 raised");
    expect(
      within(region()).getByRole("img", { name: "All ₦250,000 spent; nothing held" }),
    ).toBeInTheDocument();
    expect(region()).toHaveTextContent(
      "Everything raised has been spent: ₦250,000 on the expenses below.",
    );
  });

  it("says nothing has been raised yet", () => {
    render(<SpentHeld campaign={{ ...ramadan, raisedAmount: 0, expenses: [] }} />);
    expect(region()).toHaveTextContent("Nothing has been raised yet, so nothing has been spent.");
    expect(within(region()).queryByRole("img")).toBeNull();
  });

  it("says 'the expense' when there is only one", () => {
    render(<SpentHeld campaign={campaignDetails["eid-clothes-30-children"]!} />);
    expect(within(region()).getByText("On the expense listed below")).toBeInTheDocument();
  });

  it.each(Object.values(campaignDetails).map((c) => [c.slug, c] as const))(
    "reconciles with the expenses list: %s",
    (_slug, c: CampaignDetail) => {
      render(<AccountabilitySection campaign={c} />);
      const spent = c.expenses.reduce((sum, e) => sum + e.amount, 0);
      const split = region();
      if (c.expenses.length === 0) {
        expect(screen.queryByRole("table", { name: "Expenses with receipts" })).toBeNull();
        return;
      }
      const total = within(screen.getByRole("table", { name: "Expenses with receipts" })).getByRole(
        "rowheader",
        { name: "Total spent" },
      ).nextElementSibling!.textContent;
      expect(split).toHaveTextContent(total!);
      expect(total).toBe(formatNaira(spent));
    },
  );
});
