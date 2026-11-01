import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "@/test/server";
import { usersByRole } from "@/test/fixtures";
import { expectNoA11yViolations } from "@/test/axe";
import { renderWithProviders } from "@/test/render";
import { DashboardShell } from "./dashboard-shell";
import { areaByRole, isActive } from "./nav-config";

const pathname = vi.hoisted(() => ({ value: "/org" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.value }));

describe("nav-config", () => {
  it("matches area homes exactly and other items by prefix", () => {
    const [overview, campaigns] = areaByRole.ORG_ADMIN.nav;
    expect(isActive(overview!, "/org", "/org")).toBe(true);
    expect(isActive(overview!, "/org/campaigns", "/org")).toBe(false);
    expect(isActive(campaigns!, "/org/campaigns/abc", "/org")).toBe(true);
  });
});

describe("DashboardShell", () => {
  beforeEach(() => {
    pathname.value = "/org";
  });

  it.each([
    ["ORG_ADMIN", ["Overview", "Campaigns", "Organisation"]],
    ["WITNESS", ["Assigned", "History"]],
    ["PLATFORM_ADMIN", ["Verification", "Reviews", "Excess", "Audit log"]],
  ] as const)("shows only the %s navigation", (role, labels) => {
    pathname.value = areaByRole[role].home;
    renderWithProviders(
      <DashboardShell role={role}>
        <h1>Page</h1>
      </DashboardShell>,
    );
    const nav = screen.getByRole("navigation", { name: `${areaByRole[role].label} navigation` });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((a) => a.textContent),
    ).toEqual(labels);
  });

  it("marks the current page", () => {
    pathname.value = "/org/campaigns";
    renderWithProviders(
      <DashboardShell role="ORG_ADMIN">
        <h1>Campaigns</h1>
      </DashboardShell>,
    );
    expect(screen.getByRole("link", { name: "Campaigns" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
  });

  it("shows the signed-in user's name from /api/me", async () => {
    renderWithProviders(
      <DashboardShell role="ORG_ADMIN">
        <h1>Overview</h1>
      </DashboardShell>,
    );
    expect(await screen.findByText(usersByRole.ORG_ADMIN.name)).toBeInTheDocument();
  });

  it("still renders when /api/me fails", async () => {
    server.use(http.get("*/api/me", () => HttpResponse.json({}, { status: 401 })));
    const { container } = renderWithProviders(
      <DashboardShell role="ORG_ADMIN">
        <h1>Overview</h1>
      </DashboardShell>,
    );
    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
