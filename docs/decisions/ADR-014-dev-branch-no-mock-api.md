# ADR-014: A `dev` base branch, and no mock API from here on

- **Status:** Accepted
- **Date:** 2026-11-01
- **Deciders:** Project owner
- **Related:** ADR-003, ADR-004, ADR-008; amanah-api B0.3

## Context

ADR-003 had the frontend built against an MSW mock API until the backend existed. The backend now exists (ADR-004, repository `haneefojay/amanah-api`) and publishes its contract as `openapi.json` (B0.3). `main` is deployed to production on Vercel and must not be disturbed while the frontend and backend are wired together.

## Options considered

### Option A: Keep the mock API and swap it out later

- Pros: pages show data without a backend.
- Cons: two sources of truth for the contract, and more mock code to delete later.

### Option B: Remove the mock API and build against the real backend, on a separate base branch

- Pros: one contract; `main` and the live site stay as they are; the merge to `main` happens once, when the backend is deployed.
- Cons: `dev` previews have no data until a backend is reachable, and end-to-end specs that need data wait for backend seed data.

## Decision

Option B (owner's decision).

- **`dev` is the base branch for all frontend work.** Pull requests target `dev`, never `main`. When the backend is deployed and the frontend is wired to it, `dev` is merged into `main`.
- **No runtime mock API.** The MSW server script, the same-origin `/api/*` mock route, `ENABLE_MOCK_API`, `npm run mock:api` and `npm run dev:mock` are removed on `dev`. `main` keeps them until the merge.
- **The API base URL is the backend** (`NEXT_PUBLIC_API_BASE_URL`, default `http://localhost:8000`).
- MSW stays as a **unit-test** tool only (`src/test/`). Fixtures and handlers there are test data, not a development API.
- End-to-end specs that read campaign data run only with `E2E_BACKEND=1` against a backend with seed data (amanah-api B1).

## Consequences

- Types and schemas are reconciled with `openapi.json` (next frontend PR).
- ADR-003's mock-backed approach is superseded for new work; its contract-first and Zod-validation parts stand.
- Data-dependent E2E specs are skipped in CI until a backend with seed data is available there.
