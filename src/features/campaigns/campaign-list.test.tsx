import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { campaignListBody, campaigns, publicCampaigns } from "@/test/fixtures";
import { expectNoA11yViolations } from "@/test/axe";
import { CampaignList } from "./campaign-list";
import { listHref } from "./campaign-pagination";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const firstPage = campaignListBody(publicCampaigns.slice(0, 6), {
  total: publicCampaigns.length,
  totalPages: 2,
});

describe("CampaignList", () => {
  it("shows the heading, the filters, a card per campaign and the count", async () => {
    const { container } = render(<CampaignList result={firstPage} />);
    expect(screen.getByRole("heading", { level: 1, name: "Campaigns" })).toBeInTheDocument();
    const grid = screen.getByRole("region", { name: "Campaigns" });
    expect(within(grid).getAllByRole("article")).toHaveLength(6);
    expect(screen.getByRole("status")).toHaveTextContent("9 campaigns live or recently completed");
    expect(screen.getByLabelText("City")).toHaveValue("");
    expect(screen.getByRole("option", { name: "Ilorin" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Central Mosque, Offa" })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("keeps the chosen filters in the form", () => {
    const org = campaigns[0]!.organisationId;
    render(<CampaignList result={firstPage} city="Offa" organisation={org} />);
    expect(screen.getByLabelText("City")).toHaveValue("Offa");
    expect(screen.getByLabelText("Organisation")).toHaveValue(org);
  });

  it("goes to the filtered address as soon as a city is chosen", async () => {
    push.mockClear();
    render(<CampaignList result={firstPage} />);
    await userEvent.selectOptions(screen.getByLabelText("City"), "Offa");
    expect(push).toHaveBeenCalledWith("/campaigns?city=Offa");
    await userEvent.selectOptions(screen.getByLabelText("City"), "");
    expect(push).toHaveBeenLastCalledWith("/campaigns");
  });

  it("links to the next page and keeps the filters in the link", () => {
    render(<CampaignList result={firstPage} city="Offa" />);
    const nav = screen.getByRole("navigation", { name: "Pages" });
    expect(within(nav).getByText("Page 1 of 2")).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /Next/ })).toHaveAttribute(
      "href",
      "/campaigns?city=Offa&page=2",
    );
    expect(within(nav).queryByRole("link", { name: /Previous/ })).toBeNull();
  });

  it("shows no pagination for a single page", () => {
    const one = campaignListBody(publicCampaigns.slice(0, 2));
    render(<CampaignList result={one} />);
    expect(screen.queryByRole("navigation", { name: "Pages" })).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("2 campaigns");
  });

  it("says when nothing has been published yet", async () => {
    const { container } = render(<CampaignList result={campaignListBody([])} />);
    expect(screen.getByText("No campaigns yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See how Amanah works" })).toHaveAttribute(
      "href",
      "/#how",
    );
    await expectNoA11yViolations(container);
  });

  it("offers to clear filters when none match", () => {
    render(<CampaignList result={campaignListBody([])} city="Kano" />);
    expect(screen.getByText("No campaigns match these filters")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
      "href",
      "/campaigns",
    );
  });

  it("explains a load failure and lets the donor retry", async () => {
    const { container } = render(<CampaignList result={null} city="Offa" />);
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("We couldn’t load campaigns")).toBeInTheDocument();
    expect(within(alert).getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/campaigns?city=Offa",
    );
    expect(screen.queryByRole("article")).toBeNull();
    await expectNoA11yViolations(container);
  });
});

describe("listHref", () => {
  it("builds the list address from the filters and page", () => {
    expect(listHref({})).toBe("/campaigns");
    expect(listHref({ page: 1 })).toBe("/campaigns");
    expect(listHref({ city: "Offa", organisation: "abc", page: 3 })).toBe(
      "/campaigns?city=Offa&organisation=abc&page=3",
    );
  });
});
