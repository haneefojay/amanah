---
name: amanah
description: Project rules for Amanah, the transparent Islamic donation PWA (Next.js frontend). Use for ANY work in this repository — building or changing features, UI, copy, tests, API contracts, roadmap items, ADRs, changelog or commits — and whenever money, donations, campaigns, the donation cap, evidence, witnesses or accountability pages are involved. Load it before other design or frontend skills; its rules take precedence over theirs.
---

# Amanah project skill

Amanah lets verified Islamic organisations publish itemised needs with a fixed target. Donors give, and follow every naira through a public accountability page. **The product's whole value is trust.** A wrong number, a cached total, or a silent failure is worse than a missing feature.

Deadline: **1 November 2026**. When in doubt, cut scope, not quality.

## Before you start

1. Read `PROJECT_MEMORY.md`, then `docs/roadmap/ROADMAP_INDEX.md` (current focus and status).
2. Find the roadmap item (`F<n>.<m>` or `B<n>.<m>`) the work belongs to and read its full entry: scope, backend dependency, required tests, Definition of Done.
3. Read the spec sections it cites in `docs/amanah-mvp-spec.md`.
4. If no roadmap item covers the work, say so and propose one before building.

Detailed procedures live in the reference files. Load the one you need:

| Task                                                                                           | Read                                                                     |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Anything touching money, donations, campaign status, roles, evidence, witnesses, privacy, copy | [references/domain-rules.md](references/domain-rules.md)                 |
| Writing frontend code, adding an endpoint, writing tests, PWA behaviour                        | [references/frontend-conventions.md](references/frontend-conventions.md) |
| Claiming/finishing a roadmap item, writing an ADR, changelog, commits, PRs                     | [references/workflow.md](references/workflow.md)                         |
| Any UI, visual design, motion or UX work (which installed design skill to use, and how)        | [references/design-skills-guide.md](references/design-skills-guide.md)   |

## Hard rules (never break these)

1. **Money is integer kobo.** Never floats, never `parseFloat`, never `toFixed` on amounts. Use `formatNaira`, `parseNairaToKobo`, `progressPercent` from `src/lib/money.ts`.
2. **The donation cap belongs to the backend.** The frontend reflects `availableAmount` from the API and handles the cap error codes. It never decides on its own that a donation is allowed.
3. **Never cache money data.** API responses stay NetworkOnly in the service worker (`src/app/sw.ts`). Never show a stale remaining amount next to an enabled Donate button.
4. **General donations only.** Zakat and waqf never appear in code, copy, assets or metadata. `npm run check:terms` enforces this.
5. **Exact spec copy for cap states:** "Target reached. Donations closed." and "Target nearly reached. Pending payments are being processed."
6. **Every API call** goes through `src/lib/api` with a Zod schema **and** an MSW handler. The backend is a separate service (ADR-003); never put business logic in Next.js route handlers or server actions.
7. **Donor email and phone never appear on public pages.**
8. **Nothing is done without tests** — the ones listed in the roadmap item, plus the Global Definition of Done. Mobile (360px) first.
9. **Commits and PRs carry no AI attribution** (no `Co-Authored-By` AI trailers, no "Generated with" lines). Commit as the configured git user.
10. **Stop and ask** before touching an open decision (spec §11 D1–D11), adding a runtime dependency not covered by an ADR, or doing anything hard to reverse.

## Finish line

`npm run verify` passes · `npm run test:e2e` passes for user-facing work · roadmap index updated · `CHANGELOG.md` entry added · ADR written for any lasting decision · summary to the user with what was tested and what needs their decision.
