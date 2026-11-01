import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CampaignSummary } from "@/lib/api/schemas";
import { publicCampaigns } from "@/test/fixtures";
import { expectNoA11yViolations } from "@/test/axe";
import { FundingPanel, panelNote } from "./funding-panel";

const base = publicCampaigns.find((c) => c.slug === "ramadan-food-drive-offa")!;
const make = (over: Partial<CampaignSummary>): CampaignSummary => ({ ...base, ...over });

/**
 * F3.1: the funding summary for every state in spec §4.2 and §5, with exact copy. The target is
 * ₦500,000 throughout; amounts are kobo.
 */
const cases: {
  state: string;
  campaign: CampaignSummary;
  copy: string;
  give: boolean;
  remaining: string | null;
  progress: string;
}[] = [
  {
    state: "LIVE with money left to give",
    campaign: make({ raisedAmount: 30_000_000, availableAmount: 20_000_000 }),
    copy: "Accepting donations up to its target.",
    give: true,
    remaining: "₦200,000",
    progress: "60",
  },
  {
    state: "LIVE, nothing available but raised below target",
    campaign: make({ raisedAmount: 45_000_000, availableAmount: 0 }),
    copy: "Target nearly reached. Pending payments are being processed.",
    give: false,
    remaining: null,
    progress: "90",
  },
  {
    state: "LIVE but raised equals the target (before the switch to FUNDED)",
    campaign: make({ raisedAmount: 50_000_000, availableAmount: 0 }),
    copy: "Target reached. Donations closed.",
    give: false,
    remaining: null,
    progress: "100",
  },
  {
    state: "FUNDED",
    campaign: make({ status: "FUNDED", raisedAmount: 50_000_000, availableAmount: 0 }),
    copy: "Target reached. Donations closed.",
    give: false,
    remaining: null,
    progress: "100",
  },
  {
    state: "CLOSED below target",
    campaign: make({ status: "CLOSED", raisedAmount: 30_500_000, availableAmount: 0 }),
    copy: "This campaign has ended. Funds raised are still used for its stated purpose.",
    give: false,
    remaining: null,
    progress: "61",
  },
  {
    state: "COMPLETED",
    campaign: make({ status: "COMPLETED", raisedAmount: 50_000_000, availableAmount: 0 }),
    copy: "All items delivered and confirmed. The final report is available.",
    give: false,
    remaining: null,
    progress: "100",
  },
];

describe("FundingPanel (F3.1)", () => {
  it.each(cases)("$state", async ({ campaign, copy, give, remaining, progress }) => {
    const { container } = render(<FundingPanel campaign={campaign} />);
    const panel = screen.getByRole("region", { name: "Funding" });
    expect(within(panel).getByText(copy)).toBeInTheDocument();
    expect(within(panel).getByRole("progressbar")).toHaveAttribute("aria-valuenow", progress);
    expect(within(panel).getByText("of a ₦500,000 target")).toBeInTheDocument();

    const giveButton = within(panel).queryByRole("button", { name: /Give to this campaign/ });
    if (give) expect(giveButton).toBeVisible();
    else expect(giveButton).toBeNull();

    if (remaining) {
      expect(within(panel).getByText("Remaining").nextElementSibling).toHaveTextContent(remaining);
      expect(within(panel).getByText("Progress").nextElementSibling).toHaveTextContent(
        `${progress}%`,
      );
    } else {
      expect(within(panel).queryByText("Remaining")).toBeNull();
    }
    await expectNoA11yViolations(container);
  });

  it("shows the raised amount exactly from kobo", () => {
    render(<FundingPanel campaign={make({ raisedAmount: 30_000_050, availableAmount: 1 })} />);
    expect(screen.getByText("₦300,000.50")).toBeInTheDocument();
  });

  it("gives each state its own tone", () => {
    expect(panelNote(cases[0]!.campaign).tone).toBe("live");
    expect(panelNote(cases[1]!.campaign).tone).toBe("nearly");
    expect(panelNote(cases[3]!.campaign).tone).toBe("done");
    expect(panelNote(cases[4]!.campaign).tone).toBe("ended");
  });
});
