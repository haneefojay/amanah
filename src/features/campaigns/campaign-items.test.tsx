import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { campaignItem, type CampaignItem } from "@/lib/api/schemas";
import { campaignDetails } from "@/test/fixtures";
import { expectNoA11yViolations } from "@/test/axe";
import { CampaignItems } from "./campaign-items";
import { pendingWitnessText } from "./witness-confirmation";

const item = (over: Partial<CampaignItem>): CampaignItem => ({
  id: "9c4d1e7a-2b3f-4a50-8d61-0e1f2a3b4c90",
  name: "Rice, 50 kg bags",
  quantity: 5,
  unitCost: 5_600_000,
  totalCost: 28_000_000,
  status: "NEEDED",
  confirmation: null,
  ...over,
});

const confirmedRice = item({
  status: "DELIVERED",
  confirmation: {
    status: "CONFIRMED",
    witnessName: "Ustadh Ibrahim Yusuf",
    confirmedAt: "2026-10-14T15:30:00Z",
    comment: null,
  },
});
const disputedBags = item({
  id: "9c4d1e7a-2b3f-4a50-8d61-0e1f2a3b4c91",
  name: "School bags",
  quantity: 40,
  unitCost: 1_000_000,
  totalCost: 40_000_000,
  status: "DISPUTED",
  confirmation: {
    status: "DISPUTED",
    witnessName: "Alhaja Rukayat Adebayo",
    confirmedAt: "2026-10-15T10:20:00Z",
    comment: "Only 24 of the 30 bags reached the home.",
  },
});

const table = () =>
  screen.getByRole("table", { name: /Items this campaign will buy, with delivery status/ });
const cards = () => screen.getByRole("list", { name: "Items this campaign will buy" });

describe("CampaignItems (F3.2)", () => {
  it.each([
    ["NEEDED", "Needed", "Not delivered yet"],
    ["PURCHASED", "Purchased", "Not delivered yet"],
    ["DELIVERED", "Delivered", "Waiting for the witness"],
  ] as const)("shows a %s item with no witness word yet", (status, badge, pending) => {
    render(<CampaignItems items={[item({ status })]} target={28_000_000} />);
    const row = within(table()).getByRole("row", { name: /Rice, 50 kg bags/ });
    expect(within(row).getByText(badge)).toBeInTheDocument();
    expect(within(row).getByText(pending)).toBeInTheDocument();
    expect(pendingWitnessText(status)).toBe(pending);
  });

  it("names the witness and the date for a confirmed delivery", () => {
    render(<CampaignItems items={[confirmedRice]} target={28_000_000} />);
    const row = within(table()).getByRole("row", { name: /Rice, 50 kg bags/ });
    expect(within(row).getByText("Delivered")).toBeInTheDocument();
    expect(within(row).getByText("Confirmed by Ustadh Ibrahim Yusuf")).toBeInTheDocument();
    expect(within(row).getByText("14 October 2026")).toBeInTheDocument();
    expect(within(cards()).getByText("Confirmed by Ustadh Ibrahim Yusuf")).toBeInTheDocument();
  });

  it("shows a disputed item with the witness's comment, never as delivered", async () => {
    const { container } = render(
      <CampaignItems items={[confirmedRice, disputedBags]} target={68_000_000} />,
    );
    const row = within(table()).getByRole("row", { name: /School bags/ });
    expect(within(row).getByText("Disputed")).toBeInTheDocument();
    expect(within(row).queryByText("Delivered")).toBeNull();
    expect(within(row).getByText("Disputed by Alhaja Rukayat Adebayo")).toBeInTheDocument();
    expect(within(row).getByText("15 October 2026")).toBeInTheDocument();
    expect(within(row).getByText("“Only 24 of the 30 bags reached the home.”")).toBeInTheDocument();
    const card = within(cards()).getByText("School bags").closest("li")!;
    expect(within(card).getByText("Disputed by Alhaja Rukayat Adebayo")).toBeInTheDocument();
    expect(within(card).getByText(/Only 24 of the 30 bags/)).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("shows the quantity, unit cost and a total equal to the target", () => {
    const items = campaignDetails["ramadan-food-drive-offa"]!.items;
    render(<CampaignItems items={items} target={50_000_000} />);
    expect(within(table()).getByText("5 × ₦56,000")).toBeInTheDocument();
    const total = within(table()).getByRole("rowheader", { name: "Total, equal to the target" });
    expect(total.nextElementSibling).toHaveTextContent("₦500,000");
    expect(items.reduce((sum, i) => sum + i.totalCost, 0)).toBe(50_000_000);
  });
});

describe("campaignItem contract", () => {
  it("rejects a delivered item that the witness disputed", () => {
    expect(campaignItem.safeParse({ ...disputedBags, status: "DELIVERED" }).success).toBe(false);
  });

  it("rejects a dispute without the witness's comment", () => {
    const noComment = {
      ...disputedBags,
      confirmation: { ...disputedBags.confirmation!, comment: null },
    };
    expect(campaignItem.safeParse(noComment).success).toBe(false);
  });

  it("accepts every fixture item", () => {
    for (const c of Object.values(campaignDetails)) {
      for (const i of c.items) expect(campaignItem.safeParse(i).success, i.name).toBe(true);
    }
  });
});
