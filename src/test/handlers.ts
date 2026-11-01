import { http, HttpResponse } from "msw";
import {
  campaignDetails,
  organisationProfiles,
  campaignListBody,
  PAGE_SIZE,
  publicCampaigns,
  usersByRole,
} from "./fixtures";

/**
 * Network stubs for unit and component tests (msw/node). Test-only: nothing in the app or in
 * development serves these. Real data comes from the backend (haneefojay/amanah-api).
 */
export const handlers = [
  // Signed-in staff member.
  http.get("*/api/me", () => HttpResponse.json({ data: usersByRole.ORG_ADMIN })),

  // Public list (B5.1): live and recently completed only, filtered by city and organisation.
  http.get("*/api/campaigns", ({ request }) => {
    const url = new URL(request.url);
    const city = url.searchParams.get("city");
    const organisationId = url.searchParams.get("organisationId");
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const matching = publicCampaigns.filter(
      (c) => (!city || c.city === city) && (!organisationId || c.organisationId === organisationId),
    );
    const totalPages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
    const body = campaignListBody(matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), {
      page,
      total: matching.length,
      totalPages,
    });
    return HttpResponse.json(body);
  }),

  // One public campaign with its story and items (B5.2). Drafts and unknown slugs are 404.
  http.get("*/api/campaigns/:slug", ({ params }) => {
    const detail = campaignDetails[String(params.slug)];
    return detail
      ? HttpResponse.json({ data: detail })
      : HttpResponse.json(
          { error: { code: "NOT_FOUND", message: "Campaign not found" } },
          { status: 404 },
        );
  }),

  // A verified organisation's public profile (B3.4). Unknown or unverified ids are 404.
  http.get("*/api/organisations/:id", ({ params }) => {
    const profile = organisationProfiles[String(params.id)];
    return profile
      ? HttpResponse.json({ data: profile })
      : HttpResponse.json(
          { error: { code: "NOT_FOUND", message: "Organisation not found" } },
          { status: 404 },
        );
  }),
];
