import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CampaignUpdate } from "@/lib/api/schemas";
import { campaignDetails } from "@/test/fixtures";
import { expectNoA11yViolations } from "@/test/axe";
import { newestFirst, UpdatesTimeline } from "./updates-timeline";

const updates = campaignDetails["ramadan-food-drive-offa"]!.updates;

describe("UpdatesTimeline (F3.6)", () => {
  it("lists updates newest first, even if they arrive out of order", async () => {
    const { container } = render(<UpdatesTimeline updates={[...updates].reverse()} />);
    const posts = within(screen.getByRole("list")).getAllByRole("article");
    expect(posts.map((p) => p.getAttribute("aria-label"))).toEqual([
      "Update of 14 October 2026",
      "Update of 11 October 2026",
    ]);
    expect(within(posts[0]!).getByText(/The rice has arrived/)).toBeInTheDocument();
    expect(within(posts[0]!).getByText("14 October 2026")).toHaveAttribute(
      "dateTime",
      "2026-10-14T16:00:00Z",
    );
    await expectNoA11yViolations(container);
  });

  it("shows an update's photos, lazy-loaded", () => {
    render(<UpdatesTimeline updates={updates} />);
    const photo = screen.getByRole("img", { name: "Photo 1 from the update of 14 October 2026" });
    expect(photo).toHaveAttribute("loading", "lazy");
    const second = screen.getByRole("article", { name: "Update of 11 October 2026" });
    expect(within(second).queryByRole("img")).toBeNull();
  });

  it("says when there are no updates yet", () => {
    render(<UpdatesTimeline updates={[]} />);
    expect(
      screen.getByRole("heading", { name: "Updates from the organisation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No updates yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("sorts by posting time without changing the original list", () => {
    const list: CampaignUpdate[] = [updates[1]!, updates[0]!];
    expect(newestFirst(list)[0]).toBe(updates[0]);
    expect(list[0]).toBe(updates[1]);
  });
});
