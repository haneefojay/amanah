import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { OrganisationProfile as Profile } from "@/lib/api/schemas";
import { organisationIds, organisationProfiles } from "@/test/fixtures";
import { expectNoA11yViolations } from "@/test/axe";
import { OrganisationProfile } from "./organisation-profile";

const mosque = organisationProfiles[organisationIds.mosque]!;
const make = (over: Partial<Profile>): Profile => ({ ...mosque, ...over });

describe("OrganisationProfile", () => {
  it("shows who the organisation is, its record and its campaigns as cards", async () => {
    const { container } = render(<OrganisationProfile organisation={mosque} />);
    expect(screen.getByRole("heading", { level: 1, name: "Central Mosque, Offa" })).toBeVisible();
    expect(screen.getByText("Verified by Amanah")).toBeInTheDocument();
    expect(screen.getByText("Offa, Kwara State")).toBeInTheDocument();
    expect(screen.getByText("12 Station Road, Offa, Kwara State")).toBeInTheDocument();
    expect(screen.getByText("September 2026")).toBeInTheDocument();
    expect(screen.getByText("Since 4 Sept 2026")).toBeInTheDocument();
    const record = screen.getByRole("region", { name: "Track record" });
    expect(
      within(record).getByText("of 1 ended campaign completed and confirmed"),
    ).toBeInTheDocument();
    expect(
      within(record).getByRole("img", { name: "1 completed, 0 still delivering" }),
    ).toBeInTheDocument();
    expect(within(record).getByText("₦1,130,000")).toBeInTheDocument();
    const campaigns = screen.getByRole("region", { name: "Campaigns" });
    expect(within(campaigns).getAllByRole("article")).toHaveLength(mosque.campaigns.length);
    await expectNoA11yViolations(container);
  });

  it("does not repeat the organisation's name on each campaign card", () => {
    render(<OrganisationProfile organisation={mosque} />);
    const campaigns = screen.getByRole("region", { name: "Campaigns" });
    expect(within(campaigns).queryByText("Central Mosque, Offa")).toBeNull();
  });

  it("shows the organisation's photo when it has one", () => {
    const { container, rerender } = render(
      <OrganisationProfile organisation={make({ coverImageUrl: null })} />,
    );
    const profile = screen.getByRole("region", { name: "Central Mosque, Offa" });
    expect(profile.querySelector("img")).toBeNull();
    rerender(
      <OrganisationProfile
        organisation={make({ coverImageUrl: "/images/organisations/central-mosque-offa.jpg" })}
      />,
    );
    expect(
      screen.getByRole("region", { name: "Central Mosque, Offa" }).querySelector("img"),
    ).not.toBeNull();
    expect(container).toBeTruthy();
  });

  it("never shows the organisation type or registration number", () => {
    render(<OrganisationProfile organisation={mosque} />);
    expect(screen.queryByText(/registration number/i)).toBeNull();
    expect(screen.queryByText(/^type$/i)).toBeNull();
  });

  it("switches between all, raising now and past campaigns", async () => {
    const user = userEvent.setup();
    render(<OrganisationProfile organisation={mosque} />);
    const campaigns = screen.getByRole("region", { name: "Campaigns" });
    const total = mosque.campaigns.length;
    const live = mosque.campaigns.filter((c) => c.status === "LIVE").length;
    expect(screen.getByRole("button", { name: `All ${total}` })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: `Raising now ${live}` }));
    expect(within(campaigns).getAllByRole("article")).toHaveLength(live);
    expect(screen.getByRole("button", { name: `Raising now ${live}` })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: `Past ${total - live}` }));
    const past = within(campaigns).getAllByRole("article");
    expect(past).toHaveLength(total - live);
    for (const card of past) {
      expect(within(card).queryByRole("link", { name: /Give to this campaign/ })).toBeNull();
    }
  });

  it("explains an organisation with no ended campaigns and no past campaigns", async () => {
    const user = userEvent.setup();
    const live = mosque.campaigns.filter((c) => c.status === "LIVE");
    render(
      <OrganisationProfile
        organisation={make({
          campaigns: live,
          campaignCount: live.length,
          endedCount: 0,
          completedCount: 0,
        })}
      />,
    );
    expect(
      screen.getByText("No campaign has ended yet, so there is no completion record to show."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Past/ }));
    expect(screen.getByText("No past campaigns yet.")).toBeInTheDocument();
  });

  it("shows ended campaigns that are not completed yet as still delivering", () => {
    const society = organisationProfiles[organisationIds.society]!;
    render(<OrganisationProfile organisation={society} />);
    const record = screen.getByRole("region", { name: "Track record" });
    expect(
      within(record).getByText("of 1 ended campaign completed and confirmed"),
    ).toBeInTheDocument();
    expect(
      within(record).getByRole("img", { name: "0 completed, 1 still delivering" }),
    ).toBeInTheDocument();
  });

  it("copes with a very long name", async () => {
    const name = "The United Muslim Community Welfare and Orphan Support Association of Oke-Ode";
    const { container } = render(<OrganisationProfile organisation={make({ name })} />);
    expect(screen.getByRole("heading", { level: 1, name })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
