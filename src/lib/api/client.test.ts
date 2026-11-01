import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { organisationIds } from "@/test/fixtures";
import { server } from "@/test/server";
import { api, ApiError } from "./client";

describe("api client", () => {
  it("returns validated campaign data", async () => {
    const { data } = await api.listCampaigns();
    expect(data.length).toBeGreaterThan(0);
    expect(Number.isInteger(data[0]!.targetAmount)).toBe(true);
  });

  it("filters by city and organisation and pages the results", async () => {
    const ilorin = await api.listCampaigns({ city: "Ilorin" });
    expect(ilorin.data.length).toBeGreaterThan(0);
    expect(ilorin.data.every((c) => c.city === "Ilorin")).toBe(true);
    expect(ilorin.meta.total).toBe(ilorin.data.length);

    const org = ilorin.data[0]!.organisationId;
    const byOrg = await api.listCampaigns({ organisationId: org });
    expect(byOrg.data.every((c) => c.organisationId === org)).toBe(true);

    const all = await api.listCampaigns();
    expect(all.meta.totalPages).toBe(2);
    const second = await api.listCampaigns({ page: 2 });
    expect(second.meta.page).toBe(2);
    expect(second.data.length).toBe(all.meta.total - all.meta.pageSize);
  });

  it("never lists campaigns that are not public", async () => {
    const pages = [await api.listCampaigns(), await api.listCampaigns({ page: 2 })];
    const statuses = pages.flatMap((p) => p.data.map((c) => c.status));
    expect(statuses).not.toContain("DRAFT");
    expect(statuses).not.toContain("PENDING_REVIEW");
  });

  it("returns one campaign with its items and organisation", async () => {
    const { data } = await api.getCampaign("ramadan-food-drive-offa");
    expect(data.items).toHaveLength(3);
    expect(data.organisation.name).toBe("Central Mosque, Offa");
  });

  it("answers 404 for an unknown or draft campaign", async () => {
    await expect(api.getCampaign("nope")).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
    await expect(api.getCampaign("draft-campaign")).rejects.toMatchObject({ status: 404 });
  });

  it("returns a verified organisation with its public campaigns", async () => {
    const { data } = await api.getOrganisation(organisationIds.orphanage);
    expect(data.name).toBe("Darul Aytam Orphan Home");
    expect(data.campaigns.every((c) => c.organisationId === data.id)).toBe(true);
    expect(data.campaignCount).toBe(data.campaigns.length);
    expect(data.raisedAmount).toBe(data.campaigns.reduce((sum, c) => sum + c.raisedAmount, 0));
    expect(data).not.toHaveProperty("registrationNumber");
  });

  it("answers 404 for an organisation that is not verified", async () => {
    await expect(api.getOrganisation("8f2a1c3d-4b5e-4f60-8a7b-000000000000")).rejects.toMatchObject(
      {
        status: 404,
      },
    );
  });

  it("turns error bodies into ApiError", async () => {
    server.use(
      http.get("*/api/campaigns", () =>
        HttpResponse.json({ error: { code: "DOWN", message: "Maintenance" } }, { status: 503 }),
      ),
    );
    await expect(api.listCampaigns()).rejects.toMatchObject({ status: 503, code: "DOWN" });
  });

  it("rejects responses that break the contract", async () => {
    server.use(
      http.get("*/api/campaigns", () =>
        HttpResponse.json({ data: [{ id: "x", targetAmount: 10.5 }] }),
      ),
    );
    const error = await api.listCampaigns().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("CONTRACT_MISMATCH");
  });
});
