import { describe, expect, it } from "vitest";
import type { components } from "./generated";
import type {
  CampaignDetail,
  CampaignListResponse,
  CampaignSummary,
  CurrentUser,
  OrganisationProfile,
} from "./schemas";
import spec from "./openapi.json";

/**
 * Contract reconciliation (F0.4): the hand-written Zod schemas in schemas.ts must describe the
 * same shapes as the backend's generated types (generated.ts, from openapi.json in amanah-api).
 * The checks below are compile-time: `npm run typecheck` fails if either side drifts.
 */
type Schemas = components["schemas"];

// Both directions, so a field added on either side is caught.
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
function assertSame<T extends true>(): T | undefined {
  return undefined;
}

assertSame<Same<CampaignSummary, Schemas["CampaignSummary"]>>();
assertSame<Same<CampaignListResponse["meta"], Schemas["PageMeta"]>>();
assertSame<Same<CampaignDetail["items"][number], Schemas["CampaignItem"]>>();
assertSame<Same<CampaignDetail["expenses"][number], Schemas["Expense"]>>();
assertSame<Same<CampaignDetail["evidence"][number], Schemas["EvidencePhoto"]>>();
assertSame<Same<CampaignDetail["updates"][number], Schemas["CampaignUpdate"]>>();
assertSame<Same<CampaignDetail, Schemas["CampaignDetail"]>>();
assertSame<Same<CurrentUser, Schemas["CurrentUser"]>>();
assertSame<Same<OrganisationProfile, Schemas["OrganisationProfile"]>>();
assertSame<Same<CurrentUser["role"], Schemas["UserRole"]>>();

describe("API contract", () => {
  it("is generated from the backend OpenAPI document", () => {
    expect(spec.info.title).toBe("Amanah API");
    expect(Object.keys(spec.info["x-error-codes"])).toContain("AMOUNT_EXCEEDS_AVAILABLE");
  });
});
