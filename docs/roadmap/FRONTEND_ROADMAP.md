# Amanah Frontend Roadmap

**Scope:** the Next.js (App Router) Progressive Web App described in [`docs/amanah-mvp-spec.md`](../amanah-mvp-spec.md).
**Companion:** [`BACKEND_ROADMAP.md`](./BACKEND_ROADMAP.md). **Status tracking lives in [`ROADMAP_INDEX.md`](./ROADMAP_INDEX.md)**, not in this file.
**Created:** 18 October 2026. **Submission deadline:** 1 November 2026.

---

## How to read this roadmap

### Identifiers

- **Phase:** `F<n>` (for example `F3`, the accountability section).
- **Feature:** `F<n>.<m>` (for example `F3.2`, the items table). Feature IDs are permanent: never renumber. If a feature is dropped, mark it `Dropped` in the index and keep the ID.
- **Backend dependency:** each feature lists the `B<n>.<m>` items it needs from [`BACKEND_ROADMAP.md`](./BACKEND_ROADMAP.md). `None` means it is frontend-only.
- **Spec reference:** `§` numbers point to sections of the MVP spec.

### Priority

| Tag    | Meaning                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------- |
| **P0** | Required for the demo script (spec §10) or an acceptance criterion. Must ship by the deadline. |
| **P1** | Strongly expected for a solid MVP. Ship if P0 is done.                                         |
| **P2** | Nice to have or post-MVP. Do not start before all P0 and P1 items are done.                    |

### Working against the backend before it exists

The backend is a separate service (FastAPI on PostgreSQL, in [haneefojay/amanah-api](https://github.com/haneefojay/amanah-api); see [ADR-004](../decisions/ADR-004-backend-stack.md)). Frontend work **never waits** on the backend:

1. Define or extend the request and response schema in `src/lib/api/schemas.ts` (Zod).
2. Add an MSW handler in `src/mocks/handlers.ts` that honours the schema, including error cases.
3. Build and test the feature against the mock (`npm run dev:mock`).
4. When the matching `B` item ships, run the same tests against the real API and mark the feature's **Integration** checkbox.

A feature can therefore be **Done (mocked)** before its backend exists. It is **Done** only when integrated.

---

## Global Definition of Done (applies to every feature)

A feature is done only when all of the following are true, in addition to its own Definition of Done:

- [ ] Code is on `main` via a reviewed pull request, and the branch name or PR title contains the feature ID (for example `feat/F3.2-items-table`).
- [ ] TypeScript strict mode passes with no `any`, `@ts-ignore` or disabled lint rules unless justified in the PR.
- [ ] **Tests are written and pass.** The minimum for each feature:
  - unit tests for every pure function and hook (Vitest);
  - component tests for every interactive component, covering loading, empty, error and success states (React Testing Library and MSW);
  - at least one Playwright end-to-end test at the **mobile** viewport for every user-facing flow.
- [ ] Every API call goes through `src/lib/api` with a Zod schema, and an MSW handler exists for it.
- [ ] Money is handled as integer kobo using `src/lib/money.ts`. No floats.
- [ ] The UI is usable at 360px width, works by keyboard, has labelled controls and visible focus, and automated accessibility checks (axe) report no violations.
- [ ] Loading, empty and error states are designed, not left blank.
- [ ] No out-of-scope terminology (`npm run check:terms` passes).
- [ ] `npm run verify` and `npm run test:e2e` pass locally and in CI.
- [ ] `docs/roadmap/ROADMAP_INDEX.md` status is updated and `CHANGELOG.md` has an entry.
- [ ] Any decision made along the way is recorded as an ADR in `docs/decisions/`.

---

## F0: Foundation and development environment

**Goal:** a working, tested, installable PWA skeleton that every later phase builds on.

### F0.1 Project scaffold and tooling (P0)

- **Scope:** Next.js 16 App Router, TypeScript strict mode, Tailwind CSS v4, ESLint (including a money rule that bans `parseFloat`), Prettier, EditorConfig, `.gitattributes` (LF line endings for Windows), `.nvmrc` and `.env.example`.
- **Backend dependency:** None.
- **Tests:** `npm run lint`, `npm run typecheck` and `npm run format:check` pass on a clean clone.
- **Definition of Done:** a fresh clone followed by `npm install` and `npm run verify` succeeds on Windows and Linux. The README documents the steps.

### F0.2 Test harness (P0)

- **Scope:** Vitest with jsdom and React Testing Library, MSW (Node) wired into the test setup with `onUnhandledFrame: "error"`, Playwright with mobile (Pixel 7) and desktop projects running against a production build, and a coverage report.
- **Backend dependency:** None.
- **Tests:** example unit, component and e2e tests exist and pass.
- **Definition of Done:** `npm test`, `npm run test:coverage` and `npm run test:e2e` all pass. Contributors have a documented pattern to copy (`src/test/render.tsx`).

### F0.3 PWA baseline (P0)

- **Scope:**
  - web app manifest (`src/app/manifest.ts`) with 192px, 512px and maskable icons, plus an Apple touch icon;
  - service worker with Serwist (`src/app/sw.ts`) and an offline fallback page (`/~offline`);
  - a NetworkOnly rule for `/api/*` so money data is never cached;
  - connectivity banner (`useOffline`);
  - service worker disabled in development.
- **Backend dependency:** None.
- **Tests:** a unit test validates the manifest and checks the icons exist. E2E tests check that the manifest is served, the service worker registers, and an offline navigation shows the fallback.
- **Definition of Done:** the production build is installable in Chrome on Android, and the offline fallback works in the e2e test.

### F0.4 API client, contract layer and mock API (P0)

- **Scope:**
  - `apiFetch` with Zod validation, `ApiError` and a `CONTRACT_MISMATCH` error for unexpected responses;
  - draft schemas in `src/lib/api/schemas.ts`;
  - MSW handlers and fixtures;
  - a standalone mock HTTP API (`npm run mock:api`, port 4000), with `npm run dev:mock` to run it alongside the app;
  - TanStack Query provider.
- **Backend dependency:** **B0.3** (published OpenAPI contract). When it lands, generate types from OpenAPI and reconcile the schemas.
- **Tests:** unit tests for success, error body and contract mismatch.
- **Definition of Done:** the frontend runs end to end against the mock with no backend. After B0.3, the schemas are reconciled with the contract and a CI check flags drift.

### F0.5 Continuous integration (P0)

- **Scope:** GitHub Actions workflow (`.github/workflows/ci.yml`) that runs formatting, lint, type checks, the terminology check, unit tests with coverage, and Playwright on every push and pull request.
- **Backend dependency:** None.
- **Tests:** the workflow itself. A deliberately failing PR must be blocked.
- **Definition of Done:** the repository is on GitHub, CI is green on `main`, and branch protection requires CI.

### F0.6 Hosting and preview deployments (P0)

- **Scope:** hosting on Vercel (ADR-008), with preview deployments per pull request and a production URL over HTTPS (needed for PWA install and camera access).
- **Backend dependency:** **B12.4** for the production API URL. Previews can point at the mock API.
- **Tests:** the Playwright smoke test runs against the preview URL.
- **Definition of Done:** every PR has a preview URL, and production is reachable over HTTPS on a phone.

**Phase F0 Definition of Done:** F0.1 to F0.5 done. A new contributor goes from clone to a running app with mocks in under 10 minutes by following the README.

---

## F1: Design system and app shell

**Goal:** reusable, accessible building blocks so feature work is fast and consistent.

### F1.1 Design tokens and typography (P0)

- **Scope:** colour palette (brand green, gold, sand, ink, semantic colours), spacing, radius, shadows and a type scale in `globals.css` `@theme`. System font stack for zero font download. Document the tokens in `docs/design-system.md`.
- **Backend dependency:** None.
- **Tests:** a visual check of the token page via a Playwright screenshot at mobile width.
- **Definition of Done:** no raw hex values in components (lint or grep check). Text contrast meets WCAG AA for all text and background pairs.

### F1.2 Core UI components (P0)

- **Scope:** Button (variants, loading state), Input, Textarea, Select, Checkbox/Switch, FormField (label, hint, error), Card, Badge, Dialog/Sheet (mobile bottom sheet), Toast, Skeleton, EmptyState, ErrorState, Tabs. Decide whether to adopt shadcn/ui primitives (record an ADR).
- **Backend dependency:** None.
- **Tests:** a component test per component covering keyboard interaction, disabled and loading states, and accessible names. axe passes.
- **Definition of Done:** all components exist in `src/components/ui`, are documented in a showcase route (`/dev/ui`, excluded from production) and are used by at least one feature.

### F1.3 Money and status components (P0)

- **Scope:**
  - `MoneyAmount` (kobo to ₦);
  - `NairaInput` (typed naira to kobo via `parseNairaToKobo`, with a max-amount guard);
  - `ProgressBar` (done);
  - `CampaignStatusBadge` (all seven states in §5);
  - `VerifiedBadge`;
  - `ItemStatusBadge` (needed, purchased, delivered, disputed).
- **Backend dependency:** None.
- **Tests:** table-driven tests for every status label and colour, and `NairaInput` edge cases (commas, decimals, over-max, paste, empty).
- **Definition of Done:** status wording matches the spec exactly, including "Target reached. Donations closed."

### F1.4 App shell and navigation (P0)

- **Scope:** public header (logo, campaigns, sign in), a mobile-first layout with safe-area insets, a dashboard layout with bottom navigation on mobile and a sidebar on desktop, and a role-aware navigation config (org admin, witness, platform admin).
- **Backend dependency:** **B2.3** (current user) for role-aware navigation. Mocked until then.
- **Tests:** component tests that render the navigation for each role. An e2e test checks navigation at 360px with no horizontal scroll.
- **Definition of Done:** every route uses one of the layouts, and installed-PWA (standalone) mode looks correct.

### F1.5 Error, not-found and loading boundaries (P0)

- **Scope:** `error.tsx`, `not-found.tsx`, `global-error.tsx` and `loading.tsx` per route group, using the F1.2 states. Friendly copy with a retry action.
- **Backend dependency:** None.
- **Tests:** component tests for each boundary, and an e2e test that visits an unknown campaign slug and sees the not-found page.
- **Definition of Done:** no route shows a blank screen or a raw stack trace.

### F1.6 Accessibility test baseline (P1)

- **Scope:** add `@axe-core/playwright` and `vitest-axe`, and a shared helper `expectNoA11yViolations()`.
- **Backend dependency:** None.
- **Tests:** the helper is applied to every e2e page test from this point on.
- **Definition of Done:** CI fails on new axe violations.

**Phase F1 Definition of Done:** all P0 components exist, are tested and appear in `/dev/ui`. A new screen can be assembled without writing new base components.

---

## F2: Public discovery

**Goal:** donors can find campaigns and trust the organisations behind them (§7, Public).

### F2.1 Campaign list / home (P0)

- **Scope:** live and recently completed campaigns, filters by city and organisation (kept in URL query parameters), cards with progress, and empty and error states. Server-rendered for speed.
- **Backend dependency:** **B5.1**.
- **Tests:**
  - component tests: list, empty, error and filter behaviour (MSW);
  - e2e test: filter by city and open a campaign.
- **Definition of Done:** the page loads in under 3 seconds on emulated slow 4G (Lighthouse mobile), filters survive a page reload, and the list is integrated with B5.1.

### F2.2 Campaign card (P0)

- **Scope:** cover image (or placeholder), title, organisation with verified badge, city, progress, remaining amount and status badge.
- **Backend dependency:** **B5.1** (fields).
- **Tests:** component tests for LIVE, FUNDED, CLOSED and COMPLETED cards, plus a long-title truncation test.
- **Definition of Done:** the card is used by F2.1 and F2.4.

### F2.3 Campaign page shell (P0)

- **Scope:** `/campaigns/[slug]` with description, purpose, an items summary, a donate panel slot (F4.1) and an accountability section slot (F3). Share button using the Web Share API with a copy-link fallback.
- **Backend dependency:** **B5.2**.
- **Tests:** component tests for loading, not-found and each status. An e2e test opens a campaign from the list.
- **Definition of Done:** works for every campaign status, and an unknown slug shows not-found.

### F2.4 Organisation profile (P1)

- **Scope:** `/organisations/[id]` with verified badge, location, past campaigns and completion record.
- **Backend dependency:** **B3.4**.
- **Tests:** component tests for an organisation with and without completed campaigns. An e2e test navigates from a campaign page to the organisation.
- **Definition of Done:** only verified organisations are reachable publicly.

### F2.5 Share metadata and SEO (P2)

- **Scope:** `generateMetadata` per campaign, an Open Graph image showing progress, `robots` and `sitemap`.
- **Backend dependency:** **B5.2**.
- **Tests:** a unit test for metadata output. An e2e test checks the og:image route returns an image.
- **Definition of Done:** a shared link shows a rich preview on WhatsApp.

### F2.6 Public landing page (P0)

- **Scope:** build the approved landing page design ([design source](../design/landing-page/README.md)) at `/`:
  - a hero with the example campaign ledger and the أمانة signature;
  - sections: why, how it works (5 steps), the cap with the over-remaining demo, accountability with the phone preview, who it's for, the organisations call to action, and the footer;
  - responsive down to 360px, with a menu button replacing the nav links on narrow screens;
  - production copy only: no internal or hackathon wording on the public page.

  The page uses static example content until F2.1 and F3 exist, then links into live campaigns. Fonts per ADR-007.

- **Backend dependency:** None. It becomes live data later through F2.1 and F3.
- **Tests:**
  - component tests: each section renders its heading, all money strings are formatted from kobo, and the nav switches to the menu button on narrow screens;
  - e2e tests: renders at 360px and 1440px with no horizontal scroll, the anchor links scroll to their sections, axe reports no violations, and a terminology check;
  - a Playwright screenshot of the full page at mobile and desktop widths, attached to the PR and used for the submission document.
- **Definition of Done:** matches the approved design at both widths, Lighthouse mobile performance is 90 or higher and accessibility is 100, and the page is deployed at the public URL (F0.6) so the link always shows the latest version.

**Phase F2 Definition of Done:** a donor on a phone can browse, filter and open any public campaign. Integrated with B5.1, B5.2 and B3.4.

---

## F3: Accountability section (core feature)

**Goal:** every campaign page shows the full money trail (§7, Accountability section). This is the product's main differentiator, so polish here matters most.

### F3.1 Funding summary (P0)

- **Scope:** target, raised, remaining and progress bar, status badge, and the three UI states from §4.2:
  - `available > 0`;
  - `available == 0` but `raised < target`: "Target nearly reached. Pending payments are being processed.";
  - `FUNDED`: "Target reached. Donations closed."
- **Backend dependency:** **B5.2**.
- **Tests:** table-driven component tests for each state, with exact copy assertions.
- **Definition of Done:** the derived values match the spec formulas, and all arithmetic is integer kobo.

### F3.2 Items table with delivery status (P0)

- **Scope:** item name, quantity, unit cost, total, status (needed, purchased, delivered) and witness confirmation (confirmed or disputed with comment). A stacked card layout on mobile.
- **Backend dependency:** **B5.2** and **B9.2**.
- **Tests:** component tests for every item status, including a disputed item that shows the witness comment.
- **Definition of Done:** the sum of item totals is shown and equals the target.

### F3.3 Expenses list (P0)

- **Scope:** description, vendor, amount, date, linked item, and a receipt thumbnail that opens a full-size image viewer.
- **Backend dependency:** **B8.3**.
- **Tests:** component tests for an empty list and a list with receipts. An e2e test opens a receipt in the viewer.
- **Definition of Done:** thumbnails are lazy-loaded and sized for slow connections.

### F3.4 Evidence gallery (P0)

- **Scope:** grid of evidence photos with capture time (server timestamp, labelled as such), the client capture time if it differs, and location shown as coordinates or a static map link.
- **Backend dependency:** **B8.2**.
- **Tests:** component tests for a photo with and without location, and timestamp formatting in Africa/Lagos time.
- **Definition of Done:** the server time is shown as the authoritative time, as §7 requires.

### F3.5 Spent versus balance held (P0)

- **Scope:** a visual split of raised into spent and balance held, with totals.
- **Backend dependency:** **B5.2**.
- **Tests:** unit tests for the derivation, and component tests for 0%, partial and 100% spent.
- **Definition of Done:** values reconcile with the expenses list.

### F3.6 Updates timeline (P1)

- **Scope:** organisation updates, newest first, with images.
- **Backend dependency:** **B9.3**.
- **Tests:** component tests for ordering, the empty state and an update with images.
- **Definition of Done:** visible on every campaign page.

### F3.7 Live refresh (P0)

- **Scope:** the accountability data refreshes automatically (TanStack Query polling every 10 to 15 seconds while visible, or SSE if B5.3 provides it). Shows a subtle "updated just now" indicator. Stops polling when the tab is hidden.
- **Backend dependency:** **B5.3** (polling with ETag at minimum).
- **Tests:** a component test with fake timers that checks the UI updates when the mock data changes. An e2e test donates in one tab and sees another tab update (demo step 3).
- **Definition of Done:** demo step 3 ("the accountability page updates live") works without a manual reload.

**Phase F3 Definition of Done:** demo step 8 ("full trail: raised, spent, receipts, photos, witness confirmation") is fully visible on a phone and integrated with the backend.

---

## F4: Donation checkout

**Goal:** guest donors can give safely within the cap (§4, §7 Checkout, §8 Payments).

### F4.1 Donate panel states (P0)

- **Scope:** the donate button shows the remaining amount when `available > 0`. It is disabled with the exact §4.2 copy in the other two states. Sticky on mobile.
- **Backend dependency:** **B5.2** (for `availableAmount`) and **B6.1**.
- **Tests:** component tests for all three states. An e2e test checks the button is disabled on a FUNDED campaign.
- **Definition of Done:** it is impossible to start a checkout on a campaign that is not LIVE or has `available == 0`.

### F4.2 Checkout form (P0)

- **Scope:** amount (with quick-pick chips capped at the remaining amount), name, email and phone (Nigerian format), plus the anonymous toggle **only if D8 approves it**. Validated with react-hook-form and Zod. The form state survives an accidental reload (sessionStorage, no payment data).
- **Backend dependency:** **B6.1**.
- **Tests:** component tests for validation, the amount above remaining (client-side hint) and the submit loading state. Unit tests for the phone validator.
- **Definition of Done:** no request is sent with invalid input, and the amount is sent as integer kobo.

### F4.3 Over-remaining handling, decision D1 (P0)

- **Scope:** when the server reports the amount exceeds what is available, show "Only ₦X can be accepted" with **Give ₦X instead** and **Cancel**. Also handle "Target reached or fully reserved".
- **Backend dependency:** **B6.1** (error codes `AMOUNT_EXCEEDS_AVAILABLE` with `availableAmount`, and `TARGET_REACHED`).
- **Tests:** component tests for both error codes and for accepting the offer. An e2e test runs demo step 4: ₦300,000 is requested and ₦200,000 is offered.
- **Definition of Done:** demo steps 4 and 5 pass end to end.

### F4.4 Payment redirect and return (P0)

- **Scope:** redirect to the provider's hosted checkout URL returned by the API, then handle the return to `/donations/[reference]`. Guard against double submission.
- **Backend dependency:** **B7.2**.
- **Tests:** a component test checks a double-click creates one request. An e2e test uses the mock provider's redirect.
- **Definition of Done:** works in an installed PWA as well as the browser (the redirect leaves and returns correctly).

### F4.5 Donation result page (P0)

- **Scope:** `/donations/[reference]` polls the status (pending, then success or failed), shows the receipt reference, amount, campaign link and next steps. Clear copy if the payment is still processing.
- **Backend dependency:** **B7.5**.
- **Tests:** component tests for pending, success, failed and unknown reference (fake timers for polling). Covered by the e2e checkout test.
- **Definition of Done:** the page never claims success before the backend has confirmed the donation through the webhook.

### F4.6 Privacy notice (P1)

- **Scope:** a short data-protection notice at checkout (NDPA) and a privacy page. The public pages never show donor email or phone.
- **Backend dependency:** **B12.2**.
- **Tests:** an e2e test asserts no email or phone pattern appears in the campaign page HTML.
- **Definition of Done:** the notice has been reviewed by the team.

**Phase F4 Definition of Done:** demo steps 3 to 5 run end to end on a phone against the backend in test mode.

---

## F5: Authentication and role-based access

**Goal:** staff (org admins, witnesses, platform admins) sign in and see only what their role permits (§3).

### F5.1 Sign in and sign out (P0)

- **Scope:** `/login` with email and password, error messages that don't reveal whether an account exists, sign out, and session expiry handling. The token is stored per the backend ADR (an httpOnly cookie is preferred).
- **Backend dependency:** **B2.1**.
- **Tests:** component tests for validation, wrong credentials and the loading state. An e2e test signs in as each role.
- **Definition of Done:** no credential or token is stored in localStorage.

### F5.2 Route protection (P0)

- **Scope:** Next.js proxy (middleware) and server-side checks that redirect unauthenticated users from `/org/*`, `/witness/*` and `/admin/*` to `/login?next=…`.
- **Backend dependency:** **B2.3**.
- **Tests:** unit tests for the guard logic. E2E tests: an anonymous visitor to `/admin` is redirected, and after login returns to `/admin`.
- **Definition of Done:** no protected page renders any data before the session is confirmed.

### F5.3 Role-based landing and forbidden states (P0)

- **Scope:** after login, each role goes to its home. Wrong-role access shows a 403 page.
- **Backend dependency:** **B2.2**.
- **Tests:** e2e tests: a witness visiting `/admin` sees 403, and an org admin can't open another organisation's campaign (403 from the API, handled in the UI).
- **Definition of Done:** the access matrix in §3 is covered by tests.

### F5.4 Password reset (P2)

- **Scope:** request a reset link, then set a new password.
- **Backend dependency:** **B2.4**.
- **Tests:** component and e2e tests with a mocked email.
- **Definition of Done:** only built if time allows. For the demo, the platform admin can reset passwords manually.

**Phase F5 Definition of Done:** all three staff roles can sign in on a phone, and every protected route is guarded and tested.

---

## F6: Organisation onboarding

**Goal:** an organisation can register and get verified (§2 item 1, §3 rules).

### F6.1 Organisation registration (P0)

- **Scope:** `/register` with organisation details (name, type, address, city, state, registration number, contact person) and the first org admin account. A multi-step form on mobile.
- **Backend dependency:** **B3.1**.
- **Tests:** component tests for validation per step and back/next navigation. An e2e test completes registration.
- **Definition of Done:** after registering, the user lands on the "pending verification" view.

### F6.2 Verification documents upload (P0)

- **Scope:** upload registration documents (image or PDF), with progress, size and type limits, and the ability to remove a document before submitting.
- **Backend dependency:** **B3.2** and **B8.1** (storage).
- **Tests:** component tests for type and size rejection and upload failure with retry.
- **Definition of Done:** uploaded documents are visible to the platform admin in F11.1.

### F6.3 Verification status (P0)

- **Scope:** the dashboard shows PENDING, VERIFIED or REJECTED (with notes). Publishing actions are disabled until VERIFIED.
- **Backend dependency:** **B3.3**.
- **Tests:** component tests for each status. An e2e test checks an unverified organisation cannot submit a campaign (acceptance criterion).
- **Definition of Done:** the acceptance criterion "An unverified organisation cannot publish a campaign" is covered in the UI and in e2e.

**Phase F6 Definition of Done:** demo step 1 (admin verifies a seeded organisation) is reflected in the organisation's dashboard.

---

## F7: Campaign management (organisation dashboard)

**Goal:** org admins create, submit and manage campaigns (§5, §7 Organisation dashboard).

### F7.1 Dashboard home (P0)

- **Scope:** the organisation's campaigns grouped by status, with quick stats (raised, spent, balance) and a "Create campaign" call to action.
- **Backend dependency:** **B4.1** (list own campaigns).
- **Tests:** component tests for empty, mixed-status and error states.
- **Definition of Done:** the list reflects status changes after review.

### F7.2 Create and edit draft with items editor (P0)

- **Scope:**
  - title, purpose, description, cover image, optional end date (D10), and target amount;
  - an items editor (add, remove, reorder; name, quantity, unit cost; the total is computed);
  - a live check that **the sum of item totals equals the target**, with a clear message showing the difference;
  - autosave of the draft.
- **Backend dependency:** **B4.1**.
- **Tests:** unit tests for the totals arithmetic (integer kobo; quantity × unit cost). Component tests for adding and removing items and the mismatch message. An e2e test creates the demo campaign (₦500,000, three items).
- **Definition of Done:** it is impossible to submit when the totals don't match target, and the server error for a mismatch is also handled.

### F7.3 Submit for review and see rejection reason (P0)

- **Scope:** submit (DRAFT to PENDING_REVIEW) with a confirmation. A rejected campaign shows the admin's reason and can be edited back to DRAFT.
- **Backend dependency:** **B4.2**.
- **Tests:** component tests for each lifecycle transition the org can trigger. The e2e test is demo step 2.
- **Definition of Done:** the UI only offers the transitions the §5 state diagram allows.

### F7.4 Campaign detail: donations received (P0)

- **Scope:** a list of confirmed donations (name, or "Anonymous" if D8 is approved; amount; date) and totals. Never shows donor phone or email beyond what the org is permitted to see (decision needed; default is to hide both).
- **Backend dependency:** **B5.2** and **B7.5** (organisation donations endpoint in B4.1).
- **Tests:** component tests for the empty and populated list and the anonymous display.
- **Definition of Done:** totals reconcile with the public funding summary.

### F7.5 Close early (P0)

- **Scope:** close a LIVE campaign below target (LIVE to CLOSED) with a confirmation explaining that funds are still used for the stated purpose.
- **Backend dependency:** **B4.4**.
- **Tests:** component tests for the confirmation dialog and error handling. An e2e test closes a campaign and checks the donate button is disabled.
- **Definition of Done:** closed campaigns reject checkout in the UI and the API.

### F7.6 Locked fields after first donation (P0)

- **Scope:** the target (and, if D8 approves, title, purpose and items) is read-only once the campaign has a donation, with an explanation.
- **Backend dependency:** **B4.3**.
- **Tests:** a component test checks fields are disabled when `hasDonations` is true, and the server rejection is handled.
- **Definition of Done:** acceptance criterion "Target amount cannot be edited after the first donation" is covered in the UI.

**Phase F7 Definition of Done:** demo step 2 runs end to end, and every org-triggered lifecycle transition is tested.

---

## F8: Expenses and in-app evidence capture

**Goal:** org admins record spending with receipt and photo evidence captured in the app (§7, In-app evidence capture). This is the PWA's most demanding feature.

### F8.1 Camera capture and geolocation (P0)

- **Scope:** `<input type="file" accept="image/*" capture="environment">`, a Geolocation API request with a clear permission explanation, and the client capture time recorded. Works when location is denied (marked "location unavailable").
- **Backend dependency:** **B8.2**.
- **Tests:** component tests with mocked `navigator.geolocation` for granted, denied and timeout. An e2e test uses Playwright's `setGeolocation` and a fake file upload.
- **Definition of Done:** tested on a real Android phone over HTTPS, with the result noted in the PR.

### F8.2 Client-side image compression (P0)

- **Scope:** resize to a maximum of 1600px on the long edge and re-encode as WebP or JPEG at about quality 0.75 in a Web Worker or OffscreenCanvas, keeping the EXIF capture time where available. Target under 400 KB.
- **Backend dependency:** None.
- **Tests:** unit tests on the compression function (dimensions and size budget) using fixture images.
- **Definition of Done:** a 12 MP phone photo uploads as under 400 KB.

### F8.3 Resilient upload with offline queue (P1)

- **Scope:** upload with progress and retry. If offline, queue the evidence in IndexedDB and upload when back online (Serwist background sync or an app-level retry). The UI shows queued items.
- **Backend dependency:** **B8.1** (signed upload URLs or a multipart endpoint).
- **Tests:** unit tests for the queue (IndexedDB via fake-indexeddb). An e2e test: go offline, capture, go online, and the upload completes.
- **Definition of Done:** no evidence is lost when the connection drops mid-upload.

### F8.4 Log expense form (P0)

- **Scope:** description, amount, vendor, date spent, optional linked item, a required receipt photo and optional evidence photos. The client checks that total expenses cannot exceed raised, and the server error is handled.
- **Backend dependency:** **B8.3**.
- **Tests:** component tests for validation, the over-balance error and success. The e2e test is demo step 6.
- **Definition of Done:** acceptance criterion "Total expenses cannot exceed raised amount" is covered in the UI.

### F8.5 Mark item purchased (P1)

- **Scope:** set an item to PURCHASED when logging its expense, or manually.
- **Backend dependency:** **B8.4**.
- **Tests:** a component test for the status change and its effect on the public items table.
- **Definition of Done:** the public items table (F3.2) reflects the change.

**Phase F8 Definition of Done:** demo step 6 runs on a real phone: an expense with a receipt and evidence photo taken in the app, showing location and server time publicly.

---

## F9: Campaign updates and witness assignment

**Goal:** organisations keep donors informed and appoint independent witnesses (§2 items 7 and 8).

### F9.1 Post update (P1)

- **Scope:** short text (character limit) with optional images (reusing the F8.2 compression).
- **Backend dependency:** **B9.3**.
- **Tests:** component tests for validation and posting. An e2e test checks the update appears in the public timeline.
- **Definition of Done:** the update is visible on the campaign page within one refresh cycle.

### F9.2 Assign witness (P0)

- **Scope:** assign a witness by email (invite if new) for a campaign. Shows the error when the person is an admin of the same organisation (§3 rule).
- **Backend dependency:** **B9.1**.
- **Tests:** component tests for success and the `WITNESS_CONFLICT` error. An e2e test assigns the seeded witness.
- **Definition of Done:** acceptance criterion "A witness cannot be an admin of the same organisation" is covered in the UI.

**Phase F9 Definition of Done:** the demo campaign has a witness assigned and at least one update posted.

---

## F10: Witness experience

**Goal:** witnesses independently confirm or dispute delivery (§3, §7 Witness view).

### F10.1 Assigned campaigns (P0)

- **Scope:** `/witness` lists assigned campaigns with items awaiting confirmation.
- **Backend dependency:** **B9.1**.
- **Tests:** component tests for the empty and populated list.
- **Definition of Done:** only assigned campaigns are visible.

### F10.2 Review and confirm or dispute delivery (P0)

- **Scope:** per item, view the linked expense, receipt and evidence (reusing F3.3 and F3.4), then **Confirm** or **Dispute** with a required comment for disputes. Disputed items show as such publicly and cannot be marked delivered.
- **Backend dependency:** **B9.2**.
- **Tests:** component tests for confirm, dispute (comment required) and the API error. The e2e test is demo step 7.
- **Definition of Done:** acceptance criterion "A disputed item cannot be marked delivered" is covered in the UI, and demo step 7 passes.

**Phase F10 Definition of Done:** a witness can complete demo step 7 on a phone.

---

## F11: Platform admin console

**Goal:** the Amanah team verifies, reviews and audits (§7 Platform admin).

### F11.1 Organisation verification queue (P0)

- **Scope:** list of PENDING organisations, detail view with documents, Verify or Reject with notes.
- **Backend dependency:** **B10.1** and **B3.3**.
- **Tests:** component tests for the queue states and reject (notes required). The e2e test is demo step 1.
- **Definition of Done:** demo step 1 passes.

### F11.2 Campaign review queue (P0)

- **Scope:** list of PENDING_REVIEW campaigns, full preview, Approve or Reject with a reason, and the permissible-purpose checklist **if D8 approves it**.
- **Backend dependency:** **B10.2**.
- **Tests:** component tests for approve and reject (reason required). The e2e test is the approval part of demo step 2.
- **Definition of Done:** an approved campaign becomes publicly visible.

### F11.3 Excess records (P1)

- **Scope:** list of excess records with status. Resolve each as RETURNED or SENT_TO_BAYT_AL_MAL with notes. Shows a badge or alert when new records arrive.
- **Backend dependency:** **B10.3** and **B7.4**.
- **Tests:** component tests for each resolution and a validation test.
- **Definition of Done:** acceptance criterion "A late payment beyond target creates an ExcessRecord and alerts admin" is visible in the UI.

### F11.4 Audit log viewer (P1)

- **Scope:** read-only, filterable list (actor, entity, action, date) with the JSON payload viewer. Paginated.
- **Backend dependency:** **B10.4**.
- **Tests:** component tests for filters and pagination.
- **Definition of Done:** every demo action appears in the log.

**Phase F11 Definition of Done:** demo steps 1 and 2 (admin parts) pass, and the excess and audit views work against the backend.

---

## F12: PWA hardening

**Goal:** a PWA that feels like a native app on a mid-range Android phone.

### F12.1 Install prompt (P1)

- **Scope:** capture `beforeinstallprompt` on Android and Chrome to show an "Install Amanah" call to action. Show instructions on iOS Safari. Hidden when already installed (standalone).
- **Backend dependency:** None.
- **Tests:** component tests with a mocked `beforeinstallprompt` event, the iOS user agent and standalone mode.
- **Definition of Done:** installable from the prompt on Android, and Lighthouse's installability checks pass.

### F12.2 Update available flow (P1)

- **Scope:** when a new service worker is waiting, show "A new version is available" with **Refresh**. Never reload automatically during checkout or upload.
- **Backend dependency:** None.
- **Tests:** a component test with a mocked Serwist `waiting` event. An e2e test deploys two builds and sees the prompt (optional, manual).
- **Definition of Done:** documented in the README for the demo team.

### F12.3 Caching strategy review (P0)

- **Scope:** confirm every API response is NetworkOnly (money accuracy). Static assets and images use cache-first or stale-while-revalidate. Public campaign HTML uses network-first with the offline fallback. Recorded in ADR-002.
- **Backend dependency:** None (if the API is cross-origin, add a matcher for its origin).
- **Tests:** e2e tests: while offline, a previously visited campaign page shows cached content with the offline banner, and the donate button is disabled while offline.
- **Definition of Done:** it is impossible to see a stale "remaining amount" and start a checkout from it.

### F12.4 Offline-aware actions (P1)

- **Scope:** every mutation (donate, log expense, confirm) is disabled or queued while offline, with clear copy.
- **Backend dependency:** None.
- **Tests:** component tests with `useOffline` mocked to true for each action.
- **Definition of Done:** no silent failures offline.

### F12.5 Push notifications (P2, post-MVP)

- **Scope:** opt-in push for donors and orgs (funded, delivered). Needs VAPID keys and backend support.
- **Backend dependency:** **B11.3**.
- **Tests:** to be defined when the feature is scheduled.
- **Definition of Done:** not in the MVP unless the team decides otherwise.

**Phase F12 Definition of Done:** Lighthouse mobile PWA and installability checks pass, and offline behaviour is tested and safe for money.

---

## F13: Quality, demo readiness and release

**Goal:** the demo runs flawlessly on a phone, and every acceptance criterion in §10 is evidenced.

### F13.1 Copy and terminology review (P0)

- **Scope:** review all UI copy for clarity, tone (trust, dignity), Nigerian English and naira formatting. The terminology guard (already in CI) has no exceptions.
- **Backend dependency:** None.
- **Tests:** `npm run check:terms` in CI.
- **Definition of Done:** the team has signed off on the copy.

### F13.2 Accessibility audit (P1)

- **Scope:** manual screen-reader pass (TalkBack) over the demo flow, plus the automated axe checks.
- **Backend dependency:** None.
- **Tests:** axe on every page via F1.6.
- **Definition of Done:** no critical issues.

### F13.3 Performance on low-end devices (P0)

- **Scope:** Lighthouse mobile budgets (LCP under 2.5s, CLS under 0.1, JS under 200 KB gzipped on the campaign page) using throttled CPU and slow 4G. Images are sized and lazy-loaded.
- **Backend dependency:** None.
- **Tests:** Lighthouse CI on the campaign page and home.
- **Definition of Done:** the budgets are met, or the exceptions are documented in an ADR.

### F13.4 End-to-end demo script (P0)

- **Scope:** one Playwright spec that runs demo steps 1 to 8 (spec §10) at the mobile viewport against the integrated backend (Paystack test mode or the mock provider).
- **Backend dependency:** **all P0 B items**, **B1.3** (seed data) and **B7.1** (mock provider for deterministic runs).
- **Tests:** the spec itself. It runs nightly and before the demo.
- **Definition of Done:** green three runs in a row against staging, and the acceptance criteria checklist in §10 is mapped to tests in `docs/acceptance-matrix.md`.

### F13.5 Production release and demo kit (P0)

- **Scope:** production deploy, demo accounts, a demo-day checklist (devices charged, test cards, fallback video), and a rehearsal.
- **Backend dependency:** **B12.4** and **B1.3**.
- **Tests:** the F13.4 spec against production.
- **Definition of Done:** submitted by 1 November 2026, and the full demo is rehearsed twice on a real phone.

**Phase F13 Definition of Done:** every acceptance criterion in spec §10 maps to a passing automated test or a documented manual check.

---

## Cross-reference: frontend to backend

| Frontend    | Needs backend              |
| ----------- | -------------------------- |
| F0.4        | B0.3                       |
| F0.6        | B12.4                      |
| F1.4        | B2.3                       |
| F2.1, F2.2  | B5.1                       |
| F2.3, F2.5  | B5.2                       |
| F2.4        | B3.4                       |
| F3.1, F3.5  | B5.2                       |
| F3.2        | B5.2, B9.2                 |
| F3.3        | B8.3                       |
| F3.4        | B8.2                       |
| F3.6        | B9.3                       |
| F3.7        | B5.3                       |
| F4.1        | B5.2, B6.1                 |
| F4.2, F4.3  | B6.1                       |
| F4.4        | B7.2                       |
| F4.5        | B7.5                       |
| F4.6        | B12.2                      |
| F5.1        | B2.1                       |
| F5.2        | B2.3                       |
| F5.3        | B2.2                       |
| F5.4        | B2.4                       |
| F6.1        | B3.1                       |
| F6.2        | B3.2, B8.1                 |
| F6.3        | B3.3                       |
| F7.1, F7.2  | B4.1                       |
| F7.3        | B4.2                       |
| F7.4        | B4.1, B5.2, B7.5           |
| F7.5        | B4.4                       |
| F7.6        | B4.3                       |
| F8.1        | B8.2                       |
| F8.3        | B8.1                       |
| F8.4        | B8.3                       |
| F8.5        | B8.4                       |
| F9.1        | B9.3                       |
| F9.2, F10.1 | B9.1                       |
| F10.2       | B9.2                       |
| F11.1       | B10.1, B3.3                |
| F11.2       | B10.2                      |
| F11.3       | B10.3, B7.4                |
| F11.4       | B10.4                      |
| F12.5       | B11.3                      |
| F13.4       | all P0 B items, B1.3, B7.1 |
| F13.5       | B12.4, B1.3                |
