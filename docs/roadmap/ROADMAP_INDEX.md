# Roadmap Index

**This is the single source of truth for roadmap status.** The roadmap files describe _what_ to build and _when it counts as done_. This file records _where we are_. Every agent and contributor reads this file first and updates it last.

| File                                           | Contents                                                      |
| ---------------------------------------------- | ------------------------------------------------------------- |
| [FRONTEND_ROADMAP.md](./FRONTEND_ROADMAP.md)   | Phases `F0` to `F13`: the Next.js PWA                         |
| [BACKEND_ROADMAP.md](./BACKEND_ROADMAP.md)     | Pointer: the backend roadmap lives in `haneefojay/amanah-api` |
| [../amanah-mvp-spec.md](../amanah-mvp-spec.md) | The product specification both roadmaps are derived from      |

**Last updated:** 18 October 2026, by Claude (F3 accountability section).

---

## 1. How to use the roadmaps (agent workflow)

1. **Orient.** Read `CLAUDE.md` and `AGENTS.md`, then this file's sections 2 (Current focus) and 4 (Status board).
2. **Pick work.** Take the highest-priority item that is `Not started` and whose dependencies are `Done` or `Done (mocked)`. Order of preference:
   - P0 before P1 before P2;
   - items in the current milestone (section 3) first;
   - backend items that unblock the most P0 frontend items (the backend repository decides its own order).

   Never start an item that is `Blocked`. Never start P2 while any P0 in the current milestone is open.

3. **Claim it.** Set its status to `In progress`, put your name or agent ID in **Owner**, and set **Updated** to today.
4. **Read the full entry** in the roadmap file: scope, backend dependency, tests and Definition of Done. Read the relevant spec section.
5. **Build test-first where practical.** Write the tests listed in the entry, then the code. Meet the **Global Definition of Done** plus the item's own Definition of Done.
6. **Finish.** Set the status to `Done` (or `Done (mocked)` for frontend items whose backend isn't integrated yet). Add the PR or commit link in **Notes**, add a `CHANGELOG.md` entry, and update section 2.
7. **When blocked:** set `Blocked`, write the reason in **Notes**, add it to section 5 (Blockers) and tell the user.
8. **When a decision is needed:** don't guess on anything that is hard to reverse. Record the options in a new ADR with status `Proposed` and ask the user.
9. **Scope changes:** never renumber. Add new items with the next free ID in the right phase, and mark removed items `Dropped` with a reason.

### Status values

| Status          | Meaning                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- |
| `Not started`   | Not yet picked up                                                                             |
| `In progress`   | Claimed. Someone is working on it                                                             |
| `Done (mocked)` | Frontend only: meets its Definition of Done against the MSW mock. Backend integration pending |
| `Done`          | Meets the global and item Definition of Done, integrated and tested                           |
| `Blocked`       | Cannot proceed. The reason is in Notes and section 5                                          |
| `Dropped`       | Removed from scope. The reason is in Notes                                                    |

---

## 2. Current focus

- **Branching (ADR-014):** all frontend work goes to `dev`; `main` stays as deployed until the backend is live. The mock API is removed on `dev`; next is generating types from the backend `openapi.json` (F0.4 reconciliation).
- **Now:** F1, F2.1 to F2.4 and all of F3 (accountability section) are done against mocks, which meets M1's frontend exit criteria. Next: F4 (checkout) against mocks. F0.6: deployed at amanah-frontend-beta.vercel.app; set `ENABLE_MOCK_API=1` and `NEXT_PUBLIC_API_BASE_URL` on Vercel so `/campaigns` loads. B0.1 is done: ADR-004 accepted on 2026-11-01 (FastAPI on PostgreSQL, in a separate repository). The backend repository is [haneefojay/amanah-api](https://github.com/haneefojay/amanah-api), which now holds the spec copy, the backend roadmap, its own status index and ADR-011 to ADR-013 (auth, Railway, MinIO). Next on the backend: B0.2 service skeleton.
- **Next:** F4 (donation checkout) against mocks; F3 integrates with the backend in M3 (B5.2, B5.3, B8.2, B8.3, B9.2, B9.3).
- **Decisions needed from the team:** the cookie arrangement between frontend and API (shared parent domain or proxy, ADR-011), spec open decisions D8, D9 and D11, the convention date, and the pilot organisation.

---

## 3. Milestones (deadline 1 November 2026)

| Milestone                   | Target date | Exit criteria                                                                                                      |
| --------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| **M0: Foundation**          | 18 Oct      | F0.1 to F0.5 done (F0.5 once the repository is on GitHub)                                                          |
| **M1: Backbone**            | 22 Oct      | ADR-004 accepted; B0 and B1 done; F1 done; F2.1 to F2.3 and F3.1 to F3.5 `Done (mocked)`                           |
| **M2: Money flow**          | 26 Oct      | B2, B4.1 to B4.3, B5, B6 and B7.1 to B7.3 and B7.5 done; F4 and F5 done (integrated); concurrency suite B6.3 green |
| **M3: Accountability loop** | 29 Oct      | B3, B8, B9 and B10.1 to B10.2 done; F6 to F11 P0 items done; F3 integrated                                         |
| **M4: Demo ready**          | 31 Oct      | F12.3, F13.3, F13.4 and B12 P0 done; demo rehearsed twice on a real phone                                          |
| **Submission**              | **1 Nov**   | Submitted                                                                                                          |

These are suggested dates. Adjust them here if the team changes them, and record the change in section 6.

---

## 4. Status board

### Frontend

| ID    | Feature                                 | Pri | Status        | Owner  | Updated    | Notes                                                                                                                                                                                                                                                                                                                             |
| ----- | --------------------------------------- | --- | ------------- | ------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F0.1  | Project scaffold and tooling            | P0  | Done          | Claude | 2026-10-18 | Next.js 16.4, TS 5.9, Tailwind 4, ESLint, Prettier                                                                                                                                                                                                                                                                                |
| F0.2  | Test harness                            | P0  | Done          | Claude | 2026-10-18 | Vitest 5, RTL, MSW 3, Playwright (mobile and desktop)                                                                                                                                                                                                                                                                             |
| F0.3  | PWA baseline                            | P0  | Done          | Claude | 2026-10-18 | Serwist (Turbopack), manifest, offline fallback, `useOffline`                                                                                                                                                                                                                                                                     |
| F0.4  | API client, contract layer, mock API    | P0  | Done (mocked) | Claude | 2026-10-18 | Contract reconciled with the backend OpenAPI (types generated, drift fails typecheck)                                                                                                                                                                                                                                             |
| F0.5  | Continuous integration                  | P0  | In progress   | Claude | 2026-10-18 | Remote set to haneefojay/amanah (renamed from amanah-frontend). Done after the first push shows green CI                                                                                                                                                                                                                          |
| F0.6  | Hosting and preview deployments         | P0  | In progress   | Claude | 2026-10-25 | Deployed at amanah-frontend-beta.vercel.app by the owner. Same-origin mock API added so `/campaigns` works there (`ENABLE_MOCK_API=1`, `NEXT_PUBLIC_API_BASE_URL` = deployment URL, then redeploy). Remaining: set those env vars, redeploy, confirm `/campaigns` loads                                                           |
| F1.1  | Design tokens and typography            | P0  | Done          | Claude | 2026-10-18 | docs/design-system.md; raw-hex guard test; fonts per ADR-007                                                                                                                                                                                                                                                                      |
| F1.2  | Core UI components                      | P0  | Done          | Claude | 2026-10-18 | shadcn/ui (ADR-009), adapted to tokens; showcase at /dev/ui (dev only)                                                                                                                                                                                                                                                            |
| F1.3  | Money and status components             | P0  | Done          | Claude | 2026-10-18 | MoneyAmount, NairaInput + useNairaInput, status badges, exact spec copy in src/lib/status.ts                                                                                                                                                                                                                                      |
| F1.4  | App shell and navigation                | P0  | Done (mocked) | Claude | 2026-10-18 | DashboardShell, role nav, /api/me mocked; role from route until F5.2 / B2.3                                                                                                                                                                                                                                                       |
| F1.5  | Error, not-found and loading boundaries | P0  | Done          | Claude | 2026-10-18 | not-found, error, global-error, staff loading; unknown staff paths 404                                                                                                                                                                                                                                                            |
| F1.6  | Accessibility test baseline             | P1  | Done          | Claude | 2026-10-18 | src/test/axe.ts (components) and tests/e2e/helpers/a11y.ts (pages)                                                                                                                                                                                                                                                                |
| F2.1  | Campaign list / home                    | P0  | Done (mocked) | Claude | 2026-10-18 | `/campaigns`, server-rendered; city and organisation filters and page in the URL; waits on B5.1 and a Lighthouse run on the deployed site                                                                                                                                                                                         |
| F2.2  | Campaign card                           | P0  | Done (mocked) | Claude | 2026-10-18 | Status badge, closed and completed lines, two-line title clamp; used by F2.1 and F2.4. Waits on B5.1                                                                                                                                                                                                                              |
| F2.3  | Campaign page shell                     | P0  | Done (mocked) | Claude | 2026-10-18 | `/campaigns/[slug]`; "Give to this campaign" is in place but not wired (checkout, F4.1); accountability slot for F3; waits on B5.2                                                                                                                                                                                                |
| F2.4  | Organisation profile                    | P1  | Done (mocked) | Claude | 2026-10-18 | `/organisations/[id]`; verified organisations only (others 404); no type or registration number; waits on B3.4                                                                                                                                                                                                                    |
| F2.5  | Share metadata and SEO                  | P2  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F2.6  | Public landing page                     | P0  | In progress   | Claude | 2026-10-18 | Built and tested (unit, component, e2e mobile and desktop, axe). Remaining: deploy on Vercel (F0.6) and a Lighthouse check on the live URL                                                                                                                                                                                        |
| F3.1  | Funding summary                         | P0  | Done (mocked) | Claude | 2026-10-18 | Funding panel built in F2.3; shared derivation `accountabilityTotals` (spent, held, remaining, progress) and table-driven state tests added. Waits on B5.2                                                                                                                                                                        |
| F3.2  | Items table with delivery status        | P0  | Done (mocked) | Claude | 2026-10-18 | Witness column on the items table and a witness line on phone cards; disputed items show the comment and are never shown as delivered (schema refuses it). Waits on B5.2 and B9.2                                                                                                                                                 |
| F3.3  | Expenses list                           | P0  | Done (mocked) | Claude | 2026-10-18 | "Where the money went" band on the campaign page; expenses table (cards on phones) with lazy receipt thumbnails and a receipt viewer dialog; example receipts in public/images/receipts. Waits on B8.3                                                                                                                            |
| F3.4  | Evidence gallery                        | P0  | Done (mocked) | Claude | 2026-10-18 | Photo grid in "Where the money went": upload time (server, "Recorded by Amanah") in Lagos time, phone time when it differs, OpenStreetMap link or "Location unavailable". Waits on B8.2                                                                                                                                           |
| F3.5  | Spent versus balance held               | P0  | Done (mocked) | Claude | 2026-10-18 | Split bar and spent/held figures above the expenses; nothing raised, nothing spent and all spent states; reconciles with the expenses total for every mock campaign. Waits on B5.2                                                                                                                                                |
| F3.6  | Updates timeline                        | P1  | Done (mocked) | Claude | 2026-10-18 | Timeline at the end of "Where the money went", newest first, lazy-loaded photos, empty state. Waits on B9.3                                                                                                                                                                                                                       |
| F3.7  | Live refresh                            | P0  | Done (mocked) | Claude | 2026-10-18 | Polls GET /api/campaigns/:slug every 15 s while visible (TanStack Query), pauses when hidden, refreshes on return; status badge, funding panel, items and accountability update in place; "Updated just now", age, refresh-failed and offline states. Plain polling until B5.3 (ETag). Two-tab donation check moves to F4.5/F13.4 |
| F4.1  | Donate panel states                     | P0  | Not started   |        |            | From F3.7: when a refresh fails or the phone is offline the funding figures may be stale, so the give button must be disabled in those states (rule: never a stale remaining amount next to an enabled Donate button)                                                                                                             |
| F4.2  | Checkout form                           | P0  | Not started   |        |            | Anonymous toggle depends on D8                                                                                                                                                                                                                                                                                                    |
| F4.3  | Over-remaining handling (D1)            | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F4.4  | Payment redirect and return             | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F4.5  | Donation result page                    | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F4.6  | Privacy notice                          | P1  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F5.1  | Sign in and sign out                    | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F5.2  | Route protection                        | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F5.3  | Role-based landing and forbidden states | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F5.4  | Password reset                          | P2  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F6.1  | Organisation registration               | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F6.2  | Verification documents upload           | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F6.3  | Verification status                     | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F7.1  | Dashboard home                          | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F7.2  | Create and edit draft with items editor | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F7.3  | Submit for review                       | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F7.4  | Donations received                      | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F7.5  | Close early                             | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F7.6  | Locked fields after first donation      | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F8.1  | Camera capture and geolocation          | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F8.2  | Client-side image compression           | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F8.3  | Resilient upload with offline queue     | P1  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F8.4  | Log expense form                        | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F8.5  | Mark item purchased                     | P1  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F9.1  | Post update                             | P1  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F9.2  | Assign witness                          | P0  | Not started   |        |            | From ADR-010: witnesses are named on public pages, so assignment must tell the witness and record their agreement                                                                                                                                                                                                                 |
| F10.1 | Witness: assigned campaigns             | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F10.2 | Witness: confirm or dispute             | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F11.1 | Admin: organisation verification queue  | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F11.2 | Admin: campaign review queue            | P0  | Not started   |        |            | D8 checklist if approved                                                                                                                                                                                                                                                                                                          |
| F11.3 | Admin: excess records                   | P1  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F11.4 | Admin: audit log viewer                 | P1  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F12.1 | Install prompt                          | P1  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F12.2 | Update available flow                   | P1  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F12.3 | Caching strategy review                 | P0  | Not started   |        |            | `/api/*` is already NetworkOnly (F0.3)                                                                                                                                                                                                                                                                                            |
| F12.4 | Offline-aware actions                   | P1  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F12.5 | Push notifications                      | P2  | Not started   |        |            | Post-MVP                                                                                                                                                                                                                                                                                                                          |
| F13.1 | Copy and terminology review             | P0  | Not started   |        |            | Guard already in CI                                                                                                                                                                                                                                                                                                               |
| F13.2 | Accessibility audit                     | P1  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F13.3 | Performance on low-end devices          | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F13.4 | End-to-end demo script                  | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |
| F13.5 | Production release and demo kit         | P0  | Not started   |        |            |                                                                                                                                                                                                                                                                                                                                   |

### Backend (mirror)

The source of truth for these rows is the backend repository's [ROADMAP_INDEX.md](https://github.com/haneefojay/amanah-api/blob/main/docs/roadmap/ROADMAP_INDEX.md). When a status changes there, update it here in the same piece of work.

| ID    | Feature                                | Pri | Status      | Owner  | Updated    | Notes                                                    |
| ----- | -------------------------------------- | --- | ----------- | ------ | ---------- | -------------------------------------------------------- |
| B0.1  | Backend stack decision                 | P0  | Done        | Haneef | 2026-11-01 | ADR-004 accepted: FastAPI + PostgreSQL, separate repo    |
| B0.2  | Service skeleton                       | P0  | Not started |        |            | Ready to start in haneefojay/amanah-api                  |
| B0.3  | API contract (OpenAPI)                 | P0  | Not started |        |            | Draft frontend schemas exist in `src/lib/api/schemas.ts` |
| B0.4  | Database and migrations                | P0  | Not started |        |            | PostgreSQL required                                      |
| B0.5  | Test harness                           | P0  | Not started |        |            |                                                          |
| B1.1  | Core schema                            | P0  | Not started |        |            |                                                          |
| B1.2  | Append-only audit log                  | P0  | Not started |        |            |                                                          |
| B1.3  | Demo seed data                         | P0  | Not started |        |            | Pilot organisation `[PLACEHOLDER]`                       |
| B2.1  | Staff authentication                   | P0  | Not started |        |            |                                                          |
| B2.2  | Authorisation and organisation scoping | P0  | Not started |        |            |                                                          |
| B2.3  | Current user                           | P0  | Not started |        |            |                                                          |
| B2.4  | Password reset                         | P2  | Not started |        |            |                                                          |
| B3.1  | Organisation registration              | P0  | Not started |        |            |                                                          |
| B3.2  | Verification documents                 | P0  | Not started |        |            |                                                          |
| B3.3  | Verify or reject organisation          | P0  | Not started |        |            |                                                          |
| B3.4  | Public organisation profile            | P1  | Not started |        |            |                                                          |
| B4.1  | Draft campaigns and items              | P0  | Not started |        |            |                                                          |
| B4.2  | Lifecycle state machine                | P0  | Not started |        |            |                                                          |
| B4.3  | Immutability after first donation      | P0  | Not started |        |            | Purpose lock depends on D8                               |
| B4.4  | Close early and end dates              | P0  | Not started |        |            | D10                                                      |
| B4.5  | Completion                             | P1  | Not started |        |            |                                                          |
| B5.1  | Campaign list                          | P0  | Not started |        |            |                                                          |
| B5.2  | Campaign detail and accountability     | P0  | Not started |        |            |                                                          |
| B5.3  | Live updates support                   | P0  | Not started |        |            |                                                          |
| B6.1  | Checkout with reservations             | P0  | Not started |        |            | D1 = offer remaining, D6 = 15 min                        |
| B6.2  | Reservation expiry                     | P0  | Not started |        |            |                                                          |
| B6.3  | Concurrency test suite                 | P0  | Not started |        |            |                                                          |
| B7.1  | Payment provider adapter               | P0  | Not started |        |            | D3 = Paystack test mode                                  |
| B7.2  | Initialise transaction                 | P0  | Not started |        |            |                                                          |
| B7.3  | Webhook confirmation                   | P0  | Not started |        |            |                                                          |
| B7.4  | Excess handling                        | P0  | Not started |        |            | D9 ruling pending                                        |
| B7.5  | Donation status                        | P0  | Not started |        |            |                                                          |
| B8.1  | File storage                           | P0  | Not started |        |            |                                                          |
| B8.2  | Evidence upload                        | P0  | Not started |        |            |                                                          |
| B8.3  | Log expense                            | P0  | Not started |        |            |                                                          |
| B8.4  | Item purchase status                   | P1  | Not started |        |            |                                                          |
| B9.1  | Witness assignment                     | P0  | Not started |        |            | D2 = in-app                                              |
| B9.2  | Delivery confirmation                  | P0  | Not started |        |            |                                                          |
| B9.3  | Campaign updates                       | P1  | Not started |        |            |                                                          |
| B10.1 | Organisation verification queue        | P0  | Not started |        |            |                                                          |
| B10.2 | Campaign review queue                  | P0  | Not started |        |            |                                                          |
| B10.3 | Excess resolution                      | P1  | Not started |        |            |                                                          |
| B10.4 | Audit log query                        | P1  | Not started |        |            |                                                          |
| B11.1 | Email adapter and receipt              | P1  | Not started |        |            | Gated by D11                                             |
| B11.2 | Milestone notifications                | P2  | Not started |        |            | Gated by D11                                             |
| B11.3 | Web push                               | P2  | Not started |        |            | Post-MVP                                                 |
| B12.1 | Security hardening                     | P0  | Not started |        |            |                                                          |
| B12.2 | Data protection (NDPA)                 | P0  | Not started |        |            |                                                          |
| B12.3 | Observability                          | P1  | Not started |        |            |                                                          |
| B12.4 | Deployment                             | P0  | Not started |        |            |                                                          |

---

## 5. Blockers

| Item | Blocked by | Since | Action needed |
| ---- | ---------- | ----- | ------------- |
| none |            |       |               |

---

## 6. Open spec decisions that affect the roadmap

Defaults from spec §11 are assumed until the team decides. When one is decided, record an ADR and update the affected items.

| Decision                                | Default in use                              | Affects                 |
| --------------------------------------- | ------------------------------------------- | ----------------------- |
| D1: over-remaining donation             | Offer the remaining amount                  | F4.3, B6.1              |
| D2: witness channel                     | In-app                                      | F10, B9                 |
| D3: payment provider                    | Paystack test mode                          | B7                      |
| D4: settlement                          | Record only                                 | none in MVP             |
| D5: tech stack                          | Frontend ADR-001. Backend ADR-004 (FastAPI) | B0                      |
| D6: reservation TTL                     | 15 minutes                                  | B6.1, B6.2              |
| D7: donor accounts                      | Guest only                                  | F4.2                    |
| D8: proposed Sharia rules               | None until approved                         | F4.2, F7.6, F11.2, B4.3 |
| D9: scholarly advisor and excess ruling | `[PLACEHOLDER]`                             | B7.4, F11.3             |
| D10: campaign end dates                 | Optional                                    | F7.2, B4.4              |
| D11: email receipts                     | `[PLACEHOLDER]`                             | B11                     |

---

## 7. Index change log

| Date       | Change                                                                                                         | By     |
| ---------- | -------------------------------------------------------------------------------------------------------------- | ------ |
| 2026-11-01 | B0.1 done: ADR-004 accepted (FastAPI + PostgreSQL, separate repository). B0.2 unblocked.                       | Claude |
| 2026-11-01 | Backend repository haneefojay/amanah-api created with the spec, backend roadmap, index and ADR-011 to ADR-013. | Claude |
| 2026-10-25 | F0.6 in progress: site deployed on Vercel; same-origin mock API so public pages load there.                    | Claude |
| 2026-10-18 | F3.1 to F3.7 complete against mocks (accountability section, ADR-010). F4.1 and F9.2 notes added.              | Claude |
| 2026-10-18 | F1.1 to F1.6 complete (F1.4 mocked until auth). ADR-009 shadcn/ui.                                             | Claude |
| 2026-10-18 | F2.6 landing page built and tested; waiting on deployment.                                                     | Claude |
| 2026-10-18 | Added F2.6 public landing page (design approved). Raised F0.6 hosting to P0.                                   | Claude |
| 2026-10-18 | Roadmaps created from the MVP spec. F0.1 to F0.4 completed during environment setup.                           | Claude |
