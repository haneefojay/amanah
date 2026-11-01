# PROJECT_MEMORY.md

Project memory and standing instructions for the agent on **Amanah**. Read this first, then follow **[`AGENTS.md`](./AGENTS.md)** for the full working agreement (session start, workflow, rules, commands). Where the two disagree, this file wins for the agent.

## Purpose of this file

- A short, durable memory of **decisions, conventions and context** that the agent would otherwise have to rediscover.
- Keep it **concise and current**. Detailed history belongs in `CHANGELOG.md`, decisions in `docs/decisions/`, and status in `docs/roadmap/ROADMAP_INDEX.md`. When a fact here changes, update it in the same change.

## Project in one paragraph

Amanah is a transparent Islamic donation platform (general donations only, never zakat or waqf) built for the AMETTSA Inter-Varsity Innovation Challenge. **Deadline: 1 November 2026.** Verified organisations publish itemised campaigns with a fixed target. Donations are hard-capped at the target using database reservations. Spending is shown publicly with receipts, geotagged evidence and witness confirmations. Spec: `docs/amanah-mvp-spec.md`. Overview: `PROJECT.md`.

## Repository

- Frontend (this repo): **https://github.com/haneefojay/amanah** (default branch `main`; renamed from `amanah-frontend`).
- Backend: **https://github.com/haneefojay/amanah-api** (FastAPI, default branch `main`). It has its own `PROJECT_MEMORY.md`, `AGENTS.md`, roadmap index and ADRs. The backend roadmap and the status of `B…` items live there; the `B…` rows here are a mirror. `docs/amanah-mvp-spec.md` is identical in both repositories: change both together.

## Current architecture (as of 2026-10-18)

- **This repository is the frontend:** Next.js 16.4 App Router, TypeScript 5.9 strict, Tailwind CSS v4, **PWA via Serwist** (`@serwist/turbopack`), TanStack Query, react-hook-form with Zod, **shadcn/ui components** in `src/components/ui` (ADR-009). See ADR-001, ADR-002, ADR-006 and ADR-009. Design reference: `docs/design-system.md`; component showcase at `/dev/ui` (development only).
- **The backend is a separate service: FastAPI on PostgreSQL, in its own repository** (ADR-004, Accepted 2026-11-01). Auth is hand-written with server-side sessions in an httpOnly cookie (ADR-011); hosting starts on Railway and moves to a VPS later (ADR-012); files are in MinIO (ADR-013). The cookie needs the frontend and API on one registrable domain, or a `/api/*` rewrite proxy (ADR-011); settle this before F5.1 integration. Don't build backend logic in Next.js route handlers or server actions. The owner explicitly rejected Next.js as the backend.
- **Branches (ADR-014):** `main` is deployed and is not touched until the backend is live. All frontend work goes to **`dev`** (PRs target `dev`); `dev` is merged into `main` when the backend is deployed and wired in. **No mock API** on `dev`: build against the real backend (`NEXT_PUBLIC_API_BASE_URL`, `http://localhost:8000` locally) and its contract, `openapi.json` in amanah-api. MSW is for unit tests only (`src/test/`). Contract schemas are in `src/lib/api/schemas.ts`.
- `cacheComponents` is **off** because it's incompatible with Serwist (ADR-002).
- **Fonts (ADR-007):** Schibsted Grotesk is self-hosted with `next/font`. Reem Kufi is subset to the word أمانة only, so any new Arabic text needs a new subset. **Hosting (ADR-008):** Vercel; `main` deploys to production and each PR gets a preview.

## Conventions to remember

- Money: integer **kobo** everywhere. Format with `formatNaira()` and parse input with `parseNairaToKobo()`.
- **Campaign pages are live (F3.7, ADR-010):** `LiveCampaign` polls `GET /api/campaigns/:slug` every 15 s while visible; anything showing campaign money reads from it (`src/features/accountability/live-campaign.tsx`). Derived figures come from `accountabilityTotals()`; spent is the sum of the expenses. Witnesses are named publicly.
- Status copy must match the spec exactly, for example "Target reached. Donations closed." and "Target nearly reached. Pending payments are being processed."
- Use design tokens (`bg-brand-700`, `text-ink-600`, …) from `src/app/globals.css`, never raw hex values in components.
- Tests sit next to source files (`*.test.ts(x)`). E2E tests live in `tests/e2e/` and run against a production build on the `mobile-chrome` and `desktop-chrome` projects.
- Roadmap IDs: `F<phase>.<n>` (frontend) and `B<phase>.<n>` (backend). ADRs are `ADR-NNN`. Never renumber.
- British spelling in docs and UI ("organisation", "colour") to match the spec. Nigerian context: ₦, Africa/Lagos time zone, `en-NG` locale.

## Environment notes

- The owner develops on **Windows**. Keep scripts cross-platform (Node scripts, not bash). `.gitattributes` forces LF line endings.
- Node 22 or newer is required (`.nvmrc`). The package manager is npm.
- TypeScript is pinned to `~5.9` because typescript-eslint doesn't yet support newer versions.
- In a cloud or Linux sandbox, Playwright can use a preinstalled Chromium via `PW_CHROMIUM_PATH`.

## Standing instructions from the owner

- Before large setup or architectural work, **present suggestions and wait for the go-ahead**.
- Every feature has a **Definition of Done and tests**. Nothing is done without passing tests.
- Record every significant decision as an **ADR** with options, the decision and the date.
- Keep **`CHANGELOG.md`** updated on every change; it is the project's running memory.
- Keep **`docs/roadmap/ROADMAP_INDEX.md`** updated as the status source of truth.
- Skills for the agent live in **`.agents/skills/`**. **Load the `amanah` skill for any work in this repo**; its rules beat every other skill. Its `references/design-skills-guide.md` says which design skill (impeccable, ui-ux-pro-max, taste, Emil Kowalski skills, agent-browser) to use when.
- **Design first:** new screens and visual changes are designed and approved on the design canvas before any code is written. Public pages use production wording only (no hackathon, pilot or test-mode text).
- **`/phase <ID>`** (`.agents/commands/phase.md`) starts a roadmap phase (`F2`) or item (`F2.3`): read the project files, plan, ask questions and wait for approval before building.
- **Commits and pull requests carry no AI attribution:** no AI co-author or session trailers and no "Generated with" lines. The author is the repository's configured git user (Ojutalayo Haneef Abiola).

## Open items awaiting the owner

- Spec decisions D8, D9 and D11; the convention date; the pilot organisation.
- Connect the GitHub repository to Vercel (owner, F0.6).
- First push to `haneefojay/amanah` so CI (F0.5) runs.
