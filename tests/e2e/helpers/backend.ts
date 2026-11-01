/**
 * Specs that read campaign data need a running backend with seed data (amanah-api, B1).
 * Start it, set NEXT_PUBLIC_API_BASE_URL, then run with E2E_BACKEND=1. CI does not yet.
 */
export const hasBackend = process.env.E2E_BACKEND === "1";
export const needsBackend = "needs the backend and its seed data (set E2E_BACKEND=1)";
