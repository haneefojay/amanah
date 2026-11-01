import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CampaignSummary } from "@/lib/api/schemas";
import { campaigns } from "@/test/fixtures";
import { expectNoA11yViolations } from "@/test/axe";
import { CampaignCard } from "./campaign-card";

const make = (over: Partial<CampaignSummary>): CampaignSummary => ({ ...campaigns[0]!, ...over });

describe("CampaignCard", () => {
  it("shows a LIVE campaign with its remaining amount and a give action", async () => {
    const { container } = render(<CampaignCard campaign={make({})} />);
    const card = screen.getByRole("article", { name: "Ramadan food drive" });
    expect(within(card).getByText("Live")).toBeInTheDocument();
    expect(within(card).getByText("Offa, Kwara")).toBeInTheDocument();
    expect(within(card).getByText("₦200,000 to go")).toBeInTheDocument();
    expect(within(card).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "60");
    expect(within(card).getByRole("link", { name: /Give to this campaign/ })).toHaveAttribute(
      "href",
      "/campaigns/ramadan-food-drive-offa",
    );
    await expectNoA11yViolations(container);
  });

  it("shows a FUNDED campaign as closed to donations", () => {
    render(
      <CampaignCard
        campaign={make({ status: "FUNDED", raisedAmount: 50_000_000, availableAmount: 0 })}
      />,
    );
    expect(screen.getByText("Target reached")).toBeInTheDocument();
    expect(screen.getByText("Target reached. Donations closed.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /See where the money went/ })).toBeInTheDocument();
  });

  it("shows a CLOSED campaign that ended below target", () => {
    render(<CampaignCard campaign={make({ status: "CLOSED", availableAmount: 0 })} />);
    expect(screen.getByText("Closed")).toBeInTheDocument();
    expect(
      screen.getByText("Ended below target. Funds go to its stated purpose."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Give to this campaign/ })).toBeNull();
  });

  it("shows a COMPLETED campaign as delivered", () => {
    render(
      <CampaignCard
        campaign={make({ status: "COMPLETED", raisedAmount: 50_000_000, availableAmount: 0 })}
      />,
    );
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("All items delivered and confirmed")).toBeInTheDocument();
  });

  it("clamps a long title to two lines but keeps the full text", () => {
    const title =
      "Repairing the storm-damaged roof of the Oke-Ode community mosque and its Qur’an school";
    render(<CampaignCard campaign={make({ title })} />);
    const heading = screen.getByRole("heading", { name: title });
    expect(heading).toHaveClass("line-clamp-2");
  });
});
