import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Toaster } from "@/components/ui/sonner";
import type { CampaignDetail } from "@/lib/api/schemas";
import { campaignDetails } from "@/test/fixtures";
import { expectNoA11yViolations } from "@/test/axe";
import { renderWithProviders } from "@/test/render";
import { CampaignPage } from "./campaign-page";

const base = campaignDetails["ramadan-food-drive-offa"]!;
const make = (over: Partial<CampaignDetail>): CampaignDetail => ({ ...base, ...over });

describe("fixtures", () => {
  it("every campaign's items add up to its target", () => {
    for (const c of Object.values(campaignDetails)) {
      const total = c.items.reduce((sum, item) => sum + item.totalCost, 0);
      expect(total, c.slug).toBe(c.targetAmount);
      for (const item of c.items) expect(item.totalCost).toBe(item.quantity * item.unitCost);
    }
  });
});

describe("CampaignPage", () => {
  it("shows the story, the funding numbers and the items of a live campaign", async () => {
    const { container } = renderWithProviders(<CampaignPage campaign={base} />);
    expect(screen.getByRole("heading", { level: 1, name: "Ramadan food drive" })).toBeVisible();
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getAllByText("Offa, Kwara").length).toBeGreaterThan(0);
    const funding = screen.getByRole("region", { name: "Funding" });
    expect(within(funding).getByText("₦300,000")).toBeInTheDocument();
    expect(within(funding).getByText("of a ₦500,000 target")).toBeInTheDocument();
    expect(within(funding).getByText("₦200,000")).toBeInTheDocument();
    expect(within(funding).getByText("60%")).toBeInTheDocument();
    expect(within(funding).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "60");
    expect(within(funding).getByText("Accepting donations up to its target.")).toBeInTheDocument();
    expect(
      within(funding).getByText(/Up to ₦200,000 can be given\. Your amount is held for you/),
    ).toBeInTheDocument();
    expect(screen.getByText(base.purpose)).toBeInTheDocument();
    for (const paragraph of base.description) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    const table = screen.getByRole("table", { name: /Items this campaign will buy/ });
    expect(within(table).getByRole("rowheader", { name: /^Rice, 50 kg bags/ })).toBeInTheDocument();
    expect(within(table).getByText("Total, equal to the target")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("ends with where the money went (F3)", () => {
    renderWithProviders(<CampaignPage campaign={base} />);
    const section = screen.getByRole("region", { name: "Where the money went" });
    expect(within(section).getByRole("heading", { name: "Expenses" })).toBeInTheDocument();
  });

  it("has a give button for a live campaign that is not wired up yet", () => {
    renderWithProviders(<CampaignPage campaign={base} />);
    const give = screen.getByRole("button", { name: /Give to this campaign/ });
    expect(give).toHaveAttribute("type", "button");
    expect(give).not.toBeDisabled();
  });

  it("describes the organisation and links to its profile", () => {
    renderWithProviders(<CampaignPage campaign={base} />);
    const aside = screen.getByRole("complementary", { name: "Organisation and campaign details" });
    expect(
      within(aside).getByRole("heading", { name: "Central Mosque, Offa" }),
    ).toBeInTheDocument();
    expect(within(aside).getByText(/On Amanah since September 2026/)).toBeInTheDocument();
    expect(within(aside).getByRole("link", { name: "View organisation" })).toHaveAttribute(
      "href",
      `/organisations/${base.organisationId}`,
    );
    expect(within(aside).getByText("Published").nextElementSibling).toHaveTextContent(
      "10 October 2026",
    );
    expect(within(aside).getByText("No end date")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All campaigns" })).toHaveAttribute(
      "href",
      "/campaigns",
    );
  });

  it("closes the funding panel when the target is reached", () => {
    renderWithProviders(
      <CampaignPage
        campaign={make({ status: "FUNDED", raisedAmount: 50_000_000, availableAmount: 0 })}
      />,
    );
    const funding = screen.getByRole("region", { name: "Funding" });
    expect(within(funding).getByText("Target reached. Donations closed.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Give to this campaign/ })).toBeNull();
    expect(within(funding).getByRole("button", { name: "Share this campaign" })).toBeVisible();
  });

  it("says pending payments hold the rest when nothing is left to give", () => {
    renderWithProviders(
      <CampaignPage campaign={make({ raisedAmount: 38_000_000, availableAmount: 0 })} />,
    );
    expect(
      screen.getByText("Target nearly reached. Pending payments are being processed."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Give to this campaign/ })).toBeNull();
  });

  it("explains a closed campaign with the spec wording", () => {
    renderWithProviders(<CampaignPage campaign={make({ status: "CLOSED", availableAmount: 0 })} />);
    expect(screen.getAllByText("Closed").length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        "This campaign has ended. Funds raised are still used for its stated purpose.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Give to this campaign/ })).toBeNull();
  });

  it("explains a completed campaign with the spec wording", () => {
    renderWithProviders(
      <CampaignPage
        campaign={make({ status: "COMPLETED", raisedAmount: 50_000_000, availableAmount: 0 })}
      />,
    );
    expect(
      screen.getByText("All items delivered and confirmed. The final report is available."),
    ).toBeInTheDocument();
  });

  it("copes with a very long title and no cover photo", async () => {
    const long = campaignDetails["mosque-roof-repair-oke-ode"]!;
    const { container } = renderWithProviders(
      <CampaignPage
        campaign={{ ...long, coverImageUrl: null, expenses: [], evidence: [], updates: [] }}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: long.title })).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    await expectNoA11yViolations(container);
  });

  it("shows a message instead of an empty table when there are no items", () => {
    renderWithProviders(<CampaignPage campaign={make({ items: [] })} />);
    expect(screen.queryByRole("table", { name: /Items this campaign will buy/ })).toBeNull();
    expect(screen.getByText("The organisation hasn’t listed any items yet.")).toBeInTheDocument();
  });
});

describe("ShareButton", () => {
  afterEach(() => {
    toast.dismiss();
    vi.unstubAllGlobals();
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
  });

  it("opens the phone share sheet when there is one", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    renderWithProviders(<CampaignPage campaign={base} />);
    await userEvent.click(screen.getByRole("button", { name: "Share this campaign" }));
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Ramadan food drive", url: expect.stringMatching(/^http/) }),
    );
  });

  it("copies the link and says so where there is no share sheet", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <CampaignPage campaign={base} />
        <Toaster />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Share this campaign" }));
    expect(
      await screen.findByText("Campaign link copied. Paste it anywhere to share."),
    ).toBeVisible();
    await expect(navigator.clipboard.readText()).resolves.toMatch(/^http/);
  });

  it("does not copy when the person closes the share sheet", async () => {
    const abort = new DOMException("Closed", "AbortError");
    Object.defineProperty(navigator, "share", {
      value: vi.fn().mockRejectedValue(abort),
      configurable: true,
    });
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <CampaignPage campaign={base} />
        <Toaster />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Share this campaign" }));
    expect(screen.queryByText(/Campaign link copied/)).toBeNull();
  });
});
