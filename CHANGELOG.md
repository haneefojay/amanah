# Changelog

All notable changes to Amanah are recorded here. This file is the project's running memory: every change by any agent or contributor gets an entry.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Dates are in Africa/Lagos time. Reference roadmap IDs (`F0.3`, `B6.1`) and ADRs where relevant.

Sections per release: **Added**, **Changed**, **Fixed**, **Removed**, **Security**, **Decisions**, **Docs**.

## [Unreleased]

### Decisions

- **ADR-011 to ADR-013** (recorded in the backend repository): hand-written authentication with server-side sessions, backend hosting on Railway moving to a VPS later, and MinIO for files. Frontend impact: cookie auth needs the frontend and API on one registrable domain or a `/api/*` proxy (F0.6, F5.1).
- **ADR-004 accepted:** the backend is Python with FastAPI on PostgreSQL (SQLAlchemy, Alembic, pytest), in its own repository. A monorepo was considered and rejected because the backend is not TypeScript. Unblocks B0.2 to B0.5.

### Docs

- **Backend repository** `haneefojay/amanah-api` created with the spec copy, backend roadmap, status index, ADRs and agent guides. This repository now points to it: `BACKEND_ROADMAP.md` is a pointer, `B…` rows in the index are a mirror, and `PROJECT.md`, `README.md`, `CLAUDE.md`, `AGENTS.md`, the `amanah` skill and `/phase` mention it. The repository was renamed from `amanah-frontend` to `amanah`.

### Added

- **Same-origin mock API for deployed previews** (`src/app/api/[...path]/route.ts`): when the server-only `ENABLE_MOCK_API=1` is set, `/api/*` serves the existing MSW handlers, the same ones `npm run mock:api` serves locally. This fixes `/campaigns` on the Vercel deployment, which showed "We couldn't load campaigns" because the API base URL fell back to `http://localhost:4000`. It contains no business logic and returns 404 when the flag is unset, so it switches off cleanly once the backend (ADR-004) is live. Responses stay NetworkOnly in the service worker. Route tests cover disabled, enabled (validated against the contract schema) and unmocked endpoints. To use it on Vercel: set `ENABLE_MOCK_API=1` and `NEXT_PUBLIC_API_BASE_URL` to the deployment URL, then redeploy.
- **F3.6 Updates timeline** (approved on the design canvas): "Updates from the organisation" closes "Where the money went" with the organisation's posts, newest first (sorted on the page whatever order they arrive in), each with its date and any photos, lazy-loaded. "No updates yet." when there are none. Mock updates on five campaigns, including one explaining the disputed school bags. Component tests for ordering, photos and the empty state; e2e on phone and desktop, plus an accessibility check of the whole section. Closed as Done (mocked), waiting on B9.3.
- **F3.7 Live refresh** (approved on the design canvas): the campaign page keeps itself up to date. After the server renders it, the browser asks for the campaign every 15 seconds while the tab is visible, stops while it is hidden and refreshes as soon as it returns. The status badge, funding panel, items and "Where the money went" update in place, with no reload. An indicator says "Updated just now" or how many minutes ago; if a refresh fails or the phone is offline, the last good figures stay on screen with their time ("Couldn't refresh. Figures from 4:12 pm. Trying again.", "You're offline. Figures from 4:12 pm."). Responses are kept only in memory and are never cached (ADR-002). Component tests with fake timers (new figures, target reached, hidden tab, failure, offline, age) and an e2e test that changes the API response and sees the page update. Closed as Done (mocked), waiting on B5.3; plain polling until ETag support exists.
- **F3.5 Spent and held** (approved on the design canvas): the first card in "Where the money went" splits what was raised into what the organisation has spent (the sum of its published expenses) and what it still holds, with a split bar, the amounts and their percentages of the amount raised. Separate wording for nothing raised, nothing spent and everything spent. Unit and component tests for 0%, partial and 100% spent, and a check that the figure matches the expenses total for every mock campaign; e2e at phone and desktop sizes. Closed as Done (mocked), waiting on B5.2.
- **F3.4 Evidence gallery** (approved on the design canvas): "Photos from the ground" shows each evidence photo, lazy-loaded and labelled by its item or expense (or "General"). The upload time is shown as the authoritative time, "Recorded by Amanah", in Nigerian time; the phone's own time appears only when it reads differently; the location is shown as coordinates linking to OpenStreetMap, or "Location unavailable". The copy claims no more than a browser can prove (spec §7). Empty state when there are no photos. Mock evidence reuses the local campaign photos. Component tests for with and without location, phone time shown or hidden, Lagos time formatting and the empty state; e2e at phone and desktop sizes. Closed as Done (mocked), waiting on B8.2.
- **F3.3 Expenses and receipts** (approved on the design canvas): the campaign page now ends with "Where the money went", a full-width band. Its first part lists every expense, newest first: receipt thumbnail, what was bought and the vendor, the item it paid for (or "General"), the date and the amount, with the total spent. Phones get cards. Thumbnails are 56px and lazy-loaded; the full receipt only loads in the receipt viewer (vendor, amount, date, upload time "Recorded by Amanah", "Open full size"). Escape and the close button return focus to the thumbnail. An expense without a receipt says so. Mock receipts are generated examples marked "EXAMPLE RECEIPT" (`public/images/receipts/`). Added `formatDateTime` and `formatTime` (Africa/Lagos) and `skipOptimisation` for SVG and remote images. Component tests for empty, with and without receipts and the viewer; e2e opens a receipt at phone and desktop sizes. Closed as Done (mocked), waiting on B8.3.
- **F3.2 Items with witness confirmation** (approved on the design canvas): "What the money buys" gains a Witness column: "Confirmed by …" with the date, or "Disputed by …" with the date and the witness's comment; otherwise "Not delivered yet" or "Waiting for the witness". Quantity × unit cost now sits under the item name. Phones show the same in each item card. Mock data has a confirmed delivery on most campaigns and one disputed item (school bags). Component tests for every item status, the disputed comment and the total; e2e on phone and desktop with axe. Closed as Done (mocked), waiting on B5.2 and B9.2.
- **F3.1 Funding summary:** `accountabilityTotals` in `src/features/accountability/totals.ts` derives remaining, spent, balance held and progress in integer kobo (spec §6) and refuses expenses above the amount raised. The funding panel uses it. Table-driven tests cover every state (live, nearly reached, target reached, funded, closed, completed) with the exact spec copy. Closed as Done (mocked), waiting on B5.2.
- **F2.4 Organisation profile** (approved on the design canvas): `/organisations/[id]` shows the verified badge, location, address and when the organisation joined, its track record (ended campaigns completed and confirmed, campaigns, total raised), what verified means, and every public campaign as a full card with an All / Raising now / Past switch. The organisation type and registration number are not shown, by the owner's decision. Campaign pages link to it. Unknown or unverified organisations show a not-found page. Closed as Done (mocked), waiting on B3.4.
- **F2.3 Campaign page** (approved on the design canvas): `/campaigns/[slug]` with the cover, status, organisation, a funding panel (raised, target, remaining, the exact spec sentence for each state), purpose, description, a "What the money buys" table (a list on phones) whose total equals the target, organisation and campaign details, and how the gift is protected. Share uses the phone's share sheet, or copies the link and says so. "Give to this campaign" is shown for live campaigns but does nothing yet; the donation flow attaches to it in F4.1. An unknown or draft campaign shows a branded not-found page that search engines are told to skip. Loading skeleton included. Closed as Done (mocked), waiting on B5.2.
- **F2.1 Campaign list** (approved on the design canvas, saved in docs/design/campaign-pages): `/campaigns` is server-rendered and always loads fresh data. City and organisation filters and the page number live in the address, so they survive a reload. Six cards per page with Previous and Next, a loading skeleton, and empty, no-match and error states. The landing page's "Browse campaigns" and "Give now" and the footer now lead here, and header and footer section links on other pages go back to the landing page. Closed as Done (mocked), waiting on B5.1 and a Lighthouse run once deployed.
- **F2.2 Campaign card** (approved on the design canvas): the card now shows a status badge (Live, Target reached, Closed, Completed), the closed and completed lines ("Ended below target. Funds go to its stated purpose.", "All items delivered and confirmed"), a two-line title clamp and a truncated organisation name. Tests cover LIVE, FUNDED, CLOSED, COMPLETED and a long title. Closed as Done (mocked), waiting on B5.1.
- **Raising now** on the landing page (approved on the design canvas): up to three campaign cards from `GET /api/campaigns`, live first then funded, with cover photo, verified organisation, progress and the funding state (exact spec copy for the cap states). Renders nothing while loading, on error or with no campaigns, so the live site never shows placeholders. New `CampaignCard` and `fundingNote` in `src/features/campaigns` (groundwork for F2.1/F2.2). Mock campaigns now have Unsplash cover photos (credits in docs/design/landing-page/README.md).
- `/phase` command (`.claude/commands/phase.md`): `/phase F2` or `/phase F2.3` makes a new session read the project rules, roadmap entries, spec sections and ADRs, then present a plan and questions, and wait for approval before building, claiming and closing items per the workflow.
- **F1.2 Core UI components** on shadcn/ui (ADR-009): Button (pills, 44px, `gold` variant, `loading`), Input, Textarea, Select, Checkbox, Switch, Label, Field set, Card, Badge (status tones), Dialog, Sheet, Tabs, Skeleton, Separator, Alert, Spinner, Empty, and the Sonner Toaster (mounted in Providers). Added EmptyState and ErrorState. `components.json` is set up for the shadcn CLI. There's a development-only showcase at `/dev/ui`.
- **F1.3 Money and status components:** MoneyAmount (`<data value={kobo}>`), NairaInput with `useNairaInput` and `validateNairaText`, CampaignStatusBadge, ItemStatusBadge and VerifiedBadge. Wording and the exact spec sentences live in `src/lib/status.ts`.
- **F1.1:** `docs/design-system.md`, new semantic tokens mapped to the palette, danger tints, `src/lib/brand.ts`, and a test that fails on raw hex colours in components and pages.
- **F1.4 App shell:** DashboardShell for `/org`, `/witness` and `/admin`. It has a top bar and role-based navigation that is a sidebar on wide screens and a bottom bar on phones, and shows the current user from `/api/me` (mocked; set `MOCK_ROLE` to switch roles). Sections are prerendered and unknown sections are 404s. Placeholder pages say "Coming soon", and the staff areas are `noindex`.
- **F1.5 Boundaries:** a branded not-found page, a route error page (never shows error details) with retry, a global error page, and staff loading skeletons.
- **F1.6 Accessibility baseline:** `src/test/axe.ts` for component tests and `tests/e2e/helpers/a11y.ts` for pages. Radix test shims are in the Vitest setup.
- Dependencies: `radix-ui`, `class-variance-authority`, `lucide-react`, `sonner`. Dev dependencies: `tw-animate-css`, `axe-core`.

### Changed

- **API contract (draft), F3.6:** `CampaignDetail` gains `updates` (newest first): `id`, `body`, `images` and `postedAt`. Backend to match in B5.2 and B9.3 (ADR-003).
- **API contract (draft), F3.4:** `CampaignDetail` gains `evidence` (newest first): `id`, `imageUrl`, `thumbnailUrl`, `itemId`, `expenseId`, `latitude` and `longitude` (both or neither), `capturedAtClient` (or null) and `uploadedAtServer`. Backend to match in B5.2 and B8.2 (ADR-003).
- **API contract (draft), F3.3:** `CampaignDetail` gains `expenses` (newest first): `id`, `description`, `vendorName`, `amount` (kobo), `spentAt`, `itemId` (or null for a general cost) and `receipt` (`imageUrl`, `thumbnailUrl`, `uploadedAtServer`) or null. Spent is the sum of the expenses and is not sent separately; Zod rejects expenses that add up to more than was raised. Added a shared `imageUrl` schema. Backend to match in B5.2 and B8.3 (ADR-003).
- **API contract (draft), F3.2:** every `CampaignItem` gains `confirmation` (`status` CONFIRMED or DISPUTED, `witnessName`, `confirmedAt`, `comment`) or null. Zod rejects a dispute without a comment, and an item whose status and confirmation disagree, so a disputed item can never reach the page as delivered. Backend to match in B5.2 and B9.2 (ADR-003).
- **F2.4 organisation profile, reworked to the approved board:** off-white identity panel with the organisation's photo, a gold-on-green arch tile (it no longer shows the Amanah logo), the "Verified by Amanah" pill, and address and joining date at the foot. The track record is a dark green panel with one gold segment per ended campaign and a line on what completed means. "What verified means" sits in an outlined panel. Campaigns have a segmented All / Raising now / Past switch and compact cards without the organisation's name, four to a row on wide screens. Fixed the card's arch placeholder spilling into the card body, and the Completed badge, which used a colour token that doesn't exist (`gold-400`) and showed no background. `OrganisationProfile` gains `coverImageUrl` (draft contract, B3.4).
- **Mock photos:** every mock campaign and organisation now has a local African photo from Unsplash (credits in docs/design/campaign-pages/README.md). Added a ninth public campaign, "Prayer mats for the women's section" (funded), so the mosque's profile shows four campaigns as on the board.
- **API contract (draft), F2.4:** `GET /api/organisations/:id` returns `OrganisationProfile`: the organisation summary plus `address`, `raisedAmount` and its public `campaigns`. Only verified organisations are returned; others answer 404. It never includes type or registration number. Backend to match in B3.4 (ADR-003).
- **API contract (draft), F2.3:** `GET /api/campaigns/:slug` returns `CampaignDetail`: the summary plus `purpose`, `description` (paragraphs), `publishedAt`, `endsAt`, `items` (name, quantity, unit and total cost, status) and `organisation` (`OrganisationSummary`: location, `verifiedAt`, campaign, ended and completed counts). Drafts and unknown slugs answer 404. Backend to match in B5.2 and B3.4 (ADR-003).
- **API contract (draft), F2.1:** `GET /api/campaigns` takes `city`, `organisationId` and `page`, returns only public campaigns (live, funded, closed, completed), and responds with `data`, `meta` (`page`, `pageSize`, `total`, `totalPages`) and `filters` (`cities`, `organisations`). `CampaignSummary` gains `organisationId`. Backend to match in B5.1 (ADR-003). Mock data now has eight public campaigns and a draft that must never appear.
- **API contract (draft):** `CampaignSummary` gains `state`, and `coverImageUrl` also accepts a root-relative path. Backend to match when B5.1 is built (ADR-003).
- **F2.6 landing copy and footer:** removed the payment provider's name and technical terms from the public page ("Pay securely online", "a permanent record of every action", "Each amount is set aside while the donor pays", "Amanah enforces it"); unit and e2e guards now fail on such terms. On phones the footer wordmark is smaller and أمانة is no longer clipped.
- **F2.6 landing redesign** (approved on the design canvas): a lighter, modern page on white and soft off-white, with the mihrab arch and a thin gold eight-point star lattice as its Islamic motifs. New hero with a trust badge, three trust points and the arch window (أمانة at its crown, the example campaign card overlapping it); a statement section; accountability as a grid of cards; step cards with arch number tiles; the cap on a dark panel; audience cards; an inset organisations panel; and a footer with link columns and the large wordmark beside أمانة. Added colour tokens `brand-150/300/950`, `mist-50…300`, `ink-500/650` and the `brand` logo tone. Removed the old ledger and phone-preview components. Unit and e2e tests updated (phone, 980px and desktop layouts).
- **F2.6 landing, phone and narrow desktop** (approved on the design canvas): on phones the hero buttons share one line, أمانة is left out of the hero and the meaning sentence sits closer to the buttons (phones no longer download the Arabic display font). Between 768px and 1180px the section links stay on one line ("For organisations", and below 900px "The cap", are left out). From 900px to 1180px the example campaign stays beside the headline and the five steps share one row, so "desktop site" on a phone (about 980px) matches the desktop layout. Desktop above 1180px is unchanged. New e2e checks cover the phone buttons and the 980px layout.
- AmanahMark moved to `src/components/brand/`. Mock fixture organisations renamed to clearly fictional examples.

### Decisions

- ADR-010 Public accountability data and live refresh: witnesses named publicly, spent derived from the expenses, 15-second polling while visible, coordinates with an OpenStreetMap link, server upload time authoritative.
- ADR-009 UI components on shadcn/ui. It resolves the open "UI primitives" row of ADR-006.

### Added

- Public landing page at `/` (F2.6), built from the approved design:
  - sections: site header with a phone menu, hero with the example campaign ledger, the أمانة signature, why, how it works, the cap (with the over-remaining illustration), accountability (with a phone preview), audience, organisations call to action, and the footer;
  - all amounts come from integer kobo example data (`src/features/landing/example-campaign.ts`);
  - a skip link, labelled landmarks, and text alternatives for the illustrations.
- Self-hosted fonts per ADR-007: Schibsted Grotesk (variable, Latin) and Reem Kufi (subset to أمانة, 2 KB), with `scripts/subset-arabic-font.py` and the OFL licences in `assets/fonts/`.
- `NEXT_PUBLIC_CONTACT_EMAIL` (optional): powers "Talk to the team" and the organisation registration email. Those buttons are hidden or fall back to the section anchor when it is unset.
- Tests: example-data invariants, landing page component tests, mobile menu tests, `ProgressBar` hidden-label case, and e2e tests (`tests/e2e/landing.spec.ts`) covering no sideways scroll at 360px and 1440px, fonts loaded, axe, wording guard and navigation on desktop and mobile. 45 unit and component tests and 18 e2e tests pass.
- `npm run screenshots`: full-page landing screenshots for documents (written to `screenshots/`, gitignored).
- Dev dependencies: `@axe-core/playwright`, `cross-env`.

### Changed

- Landing page refinement (approved on the canvas 2026-10-18): hero intro shortened to one sentence and the line under the buttons removed, on all screen sizes. On phones the hero now ends with a smaller أمانة at the bottom right, and the example campaign follows the hero on the sand background under "What you see on every campaign".
- Design tokens extended (`brand-200`, `gold-100/700/800`, `sand-200` to `sand-600`, `ink-700`). Smooth scrolling for in-page links.
- `ProgressBar` accepts `showLabel`, `trackClassName` and `barClassName`.
- Replaced the temporary F0 home page with the landing page. Updated the PWA e2e test accordingly.

### Decisions

- ADR-007 Typography: self-hosted Schibsted Grotesk, plus Reem Kufi cut down to أمانة. Supersedes the fonts row of ADR-006.
- ADR-008 Frontend hosting on Vercel.

### Docs

- F3 accountability design approved on the canvas: snapshots `accountability*.dc.html` and the decisions in `docs/design/campaign-pages/README.md`.
- Landing page design approved; source and canvas link saved in `docs/design/landing-page/`. Added roadmap item F2.6 and raised F0.6 (hosting) to P0.

### Added

- Project skill `.claude/skills/amanah` (project rules, domain rules, frontend conventions, workflow, design-skill routing).
- Anthropic's official `frontend-design` skill, with its role added to the Amanah design-skills guide.
- Third-party skills via the `skills` CLI, pinned in `skills-lock.json`: impeccable, ui-ux-pro-max, design-taste-frontend, agent-browser and 13 Emil Kowalski skills (excluding native-only `write-swift` and `animate-expo`).

### Changed

- Prettier and ESLint ignore third-party skill folders; `.taste-skill/` working files are gitignored.
- Commit convention: no AI attribution trailers in commits or PRs; existing commits re-authored as Ojutalayo Haneef Abiola (`CLAUDE.md`, `AGENTS.md`).
- Set the git remote `origin` to https://github.com/haneefojay/amanah-frontend and recorded it in `CLAUDE.md` and `PROJECT.md` (F0.5).

## [0.1.0] - 2026-10-18

Initial development environment and project documentation.

### Added

- Next.js 16.4 App Router frontend with TypeScript 5.9 (strict, `noUncheckedIndexedAccess`) and Tailwind CSS v4 (F0.1).
- PWA baseline (F0.3):
  - web app manifest with 192px, 512px and maskable icons, plus an Apple touch icon;
  - Serwist service worker (`src/app/sw.ts`) with an `/~offline` fallback;
  - `/api/*` network-only so money data is never cached;
  - offline banner via `next/offline`;
  - security headers including a camera and geolocation permissions policy.
- API layer (F0.4): `apiFetch` with Zod response validation and `ApiError`; draft contract schemas; MSW handlers and fixtures; standalone mock API (`npm run mock:api`); TanStack Query provider.
- Money utilities in integer kobo: `formatNaira`, `parseNairaToKobo`, `progressPercent` and `assertKobo`, with tests.
- `ProgressBar` component (accessible) and a temporary home page.
- Test harness (F0.2): Vitest 5, React Testing Library, MSW 3, Playwright 1.64 (Pixel 7 and Desktop Chrome projects against a production build). 25 unit and component tests and 6 e2e tests, all passing.
- Out-of-scope terminology guard (`npm run check:terms`) with tests.
- ESLint rules banning `parseFloat` for money. Prettier with the Tailwind plugin. EditorConfig. `.gitattributes` (LF). `.nvmrc` (Node 22). `.env.example`. VS Code recommended settings.
- GitHub Actions CI workflow (F0.5; activates when pushed to GitHub).

### Decisions

- ADR-001 Frontend framework: Next.js App Router with TypeScript (Accepted).
- ADR-002 PWA strategy: Serwist; money data network-only; `cacheComponents` turned off (Accepted).
- ADR-003 Separate backend service; contract-first, mock-backed frontend (Accepted).
- ADR-004 Backend stack (Accepted 2026-11-01: FastAPI on PostgreSQL, separate repository).
- ADR-005 Frontend testing strategy (Accepted).
- ADR-006 Frontend supporting libraries (Accepted).

### Docs

- Moved the MVP specification to `docs/amanah-mvp-spec.md`.
- Added `docs/roadmap/FRONTEND_ROADMAP.md` (F0 to F13), `BACKEND_ROADMAP.md` (B0 to B12) and `ROADMAP_INDEX.md` (status board, milestones, agent workflow).
- Added `PROJECT.md`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/decisions/` (index and template) and `.claude/skills/README.md`.
