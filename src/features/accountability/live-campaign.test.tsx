import { focusManager, onlineManager } from "@tanstack/react-query";
import { act, screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { campaignDetails } from "@/test/fixtures";
import { server } from "@/test/server";
import { renderWithProviders } from "@/test/render";
import {
  LIVE_REFRESH_MS,
  LiveAccountability,
  LiveCampaign,
  LiveFundingPanel,
  liveIndicatorText,
} from "./live-campaign";

const ramadan = campaignDetails["ramadan-food-drive-offa"]!;
const AT = Date.parse("2026-10-14T15:12:00Z"); // 4:12 pm in Lagos

describe("liveIndicatorText (F3.7)", () => {
  const base = { updatedAt: AT, now: AT, failed: false, online: true };
  it.each([
    [{}, "Updated just now", "fresh"],
    [{ now: AT + 59_000 }, "Updated just now", "fresh"],
    [{ now: AT + 60_000 }, "Updated 1 minute ago", "aging"],
    [{ now: AT + 3 * 60_000 + 5_000 }, "Updated 3 minutes ago", "aging"],
    [{ failed: true }, "Couldn’t refresh. Figures from 4:12 pm. Trying again.", "failed"],
    [{ online: false, failed: true }, "You’re offline. Figures from 4:12 pm.", "offline"],
  ])("%o → %s", (over, text, tone) => {
    expect(liveIndicatorText({ ...base, ...over })).toEqual({ text, tone });
  });
});

describe("LiveCampaign (F3.7)", () => {
  let requests = 0;
  let raised = ramadan.raisedAmount;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    requests = 0;
    raised = ramadan.raisedAmount;
    server.use(
      http.get("*/api/campaigns/:slug", () => {
        requests += 1;
        return HttpResponse.json({
          data: { ...ramadan, raisedAmount: raised, availableAmount: 50_000_000 - raised },
        });
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    focusManager.setFocused(undefined);
    onlineManager.setOnline(true);
  });

  const renderLive = () =>
    renderWithProviders(
      <LiveCampaign initial={ramadan}>
        <LiveFundingPanel />
        <LiveAccountability />
      </LiveCampaign>,
    );
  const funding = () => screen.getByRole("region", { name: "Funding" });

  it("shows the server's figures straight away without fetching again", () => {
    renderLive();
    expect(within(funding()).getByText("₦300,000")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Updated just now");
    expect(requests).toBe(0);
  });

  it("refreshes every 15 seconds and shows the new figures without a reload", async () => {
    renderLive();
    raised = 35_000_000;
    await act(() => vi.advanceTimersByTimeAsync(LIVE_REFRESH_MS));
    expect(await within(funding()).findByText("₦350,000")).toBeInTheDocument();
    expect(within(funding()).getByText("Remaining").nextElementSibling).toHaveTextContent(
      "₦150,000",
    );
    expect(screen.getByRole("region", { name: "Spent and held" })).toHaveTextContent(
      "Of ₦350,000 raised so far",
    );
    expect(requests).toBe(1);
  });

  it("switches to the closed state when the target is reached between refreshes", async () => {
    renderLive();
    raised = 50_000_000;
    await act(() => vi.advanceTimersByTimeAsync(LIVE_REFRESH_MS));
    expect(
      await within(funding()).findByText("Target reached. Donations closed."),
    ).toBeInTheDocument();
    expect(within(funding()).queryByRole("button", { name: /Give to this campaign/ })).toBeNull();
  });

  it("stops polling while the tab is hidden and refreshes when it comes back", async () => {
    renderLive();
    act(() => focusManager.setFocused(false));
    await act(() => vi.advanceTimersByTimeAsync(LIVE_REFRESH_MS * 4));
    expect(requests).toBe(0);
    raised = 31_000_000;
    act(() => focusManager.setFocused(true));
    expect(await within(funding()).findByText("₦310,000")).toBeInTheDocument();
    expect(requests).toBe(1);
  });

  it("keeps the last good figures and says so when a refresh fails", async () => {
    renderLive();
    server.use(
      http.get("*/api/campaigns/:slug", () =>
        HttpResponse.json({ error: { code: "UNAVAILABLE", message: "Down" } }, { status: 503 }),
      ),
    );
    await act(() => vi.advanceTimersByTimeAsync(LIVE_REFRESH_MS));
    expect(
      await screen.findByText(/^Couldn’t refresh\. Figures from .+\. Trying again\.$/),
    ).toBeInTheDocument();
    expect(within(funding()).getByText("₦300,000")).toBeInTheDocument();
  });

  it("says when the phone is offline", async () => {
    renderLive();
    act(() => onlineManager.setOnline(false));
    expect(await screen.findByText(/^You’re offline\. Figures from /)).toBeInTheDocument();
  });

  it("shows how old the figures are as time passes", async () => {
    renderLive();
    act(() => focusManager.setFocused(false));
    await act(() => vi.advanceTimersByTimeAsync(2 * 60_000 + 1_000));
    expect(screen.getByRole("status")).toHaveTextContent("Updated 2 minutes ago");
  });
});
