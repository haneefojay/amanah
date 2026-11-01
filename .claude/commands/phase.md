---
description: Start a roadmap phase or item (e.g. /phase F2 or /phase F2.3). Reads the project rules, plans, asks questions, and waits for approval before building.
argument-hint: <F<n> | F<n>.<m> | B<n> | B<n>.<m>>
---

# /phase $ARGUMENTS

You are starting work on roadmap **$ARGUMENTS** for Amanah. This is a fresh session, so you have no memory of earlier work: build your context from the repository files below before anything else.

This command has three stages: **1. Read**, **2. Plan and ask**, **3. Build after approval**. Do not skip or merge them. Whether or not the session is in plan mode, **you must not edit any file, install anything, change roadmap status, or commit until the owner has approved the plan** in stage 2.

---

## 0. Check the argument

- Valid forms: `F<n>` (a whole frontend phase, e.g. `F2`), `F<n>.<m>` (one frontend item, e.g. `F2.3`), and the same with `B` for the backend roadmap.
- If `$ARGUMENTS` is empty or does not match one of these, stop and ask which phase or item to start. Do nothing else.
- `F…` items live in `docs/roadmap/FRONTEND_ROADMAP.md`. This repository is the frontend. `B…` items belong to the backend repository (https://github.com/haneefojay/amanah-api); for a `B…` argument, say so and stop. Work on it starts there with its own `/phase` command.

## 1. Read (no edits yet)

Read these in order. Read whole files, not excerpts, unless a file is very long; then read every section relevant to $ARGUMENTS in full.

1. `CLAUDE.md`: project memory and the owner's standing instructions. It wins over everything else for Claude.
2. `AGENTS.md`: the working agreement (session start, workflow, non-negotiable rules, when to stop and ask, repo map, commands).
3. The `amanah` skill: `.claude/skills/amanah/SKILL.md` and all four of its references:
   - `references/domain-rules.md`
   - `references/frontend-conventions.md`
   - `references/workflow.md`
   - `references/design-skills-guide.md`
4. `PROJECT.md`: the project overview.
5. `docs/roadmap/ROADMAP_INDEX.md`: current focus, milestones and deadline, the status board, blockers, open spec decisions.
6. The roadmap file for $ARGUMENTS:
   - "How to read this roadmap" and the **Global Definition of Done**.
   - **The full entry for every item in scope.** For `F<n>`, that is every `F<n>.<m>` item in the phase. For `F<n>.<m>`, that is that item, plus the phase introduction.
   - The entries of any items they depend on.
7. `docs/amanah-mvp-spec.md`: every section the in-scope items cite, plus §1 (scope), §4 (the donation cap), §9 (non-functional rules) and §11 (open decisions).
8. `docs/decisions/README.md` and every ADR related to the work (always ADR-003 contract-first and mocks, ADR-005 testing, ADR-006 libraries, ADR-009 UI components; ADR-002 if the PWA or caching is touched; ADR-007 if text or fonts change).
9. The latest entries in `CHANGELOG.md` (at least the whole `[Unreleased]` section).
10. For UI work: `docs/design-system.md` and anything under `docs/design/`.
11. The code that already exists for this area. Look at `src/lib/api/schemas.ts`, `src/mocks/handlers.ts` and `src/mocks/fixtures.ts` for the API contract, and at `src/components/ui` and `src/components/shell` for components to reuse. Also read any `src/features/<area>` folder and the matching `tests/e2e` specs. Prefer reusing what is there to writing something new.
12. The Next.js docs in `node_modules/next/dist/docs/` for any Next.js API you plan to use. This version differs from your training data (see AGENTS.md).

Then check the status board for each in-scope item:

- Skip items that are already `Done` or `Done (mocked)`, and say so.
- Flag items that are `Blocked`, or whose dependencies are not `Done` or `Done (mocked)`.
- If an item is `In progress` under another owner, say so and ask before taking it over.

## 2. Plan and ask (then STOP and wait)

Present the following to the owner. Use plan mode's plan if the session is in plan mode; otherwise post it as a normal message. Keep it concrete and skimmable.

1. **Scope.** List the items you will build, in build order, each with its ID, title and priority. Add one line on what each delivers to the user. List what is excluded and why (already done, blocked, P2 deferred, out of scope).
2. **Per item:**
   - The files you will create or change.
   - The components, routes and hooks involved.
   - The API endpoints, with their Zod schema and MSW handler, mocked or real.
   - The tests from its roadmap entry: unit, component and e2e, including the phone (360px) and accessibility checks.
   - How its own Definition of Done will be met.
3. **Contract and backend.** Note every new or changed API shape. It must go into `src/lib/api/schemas.ts` with an MSW handler, and be noted for the backend roadmap (ADR-003).
4. **Design.** For any new screen, or any visual change to a screen that already has an approved design, the owner's rule is: **design first on the design canvas, get approval, and only then write code**. Say which screens need a design pass. Ask whether to design them first, or to build directly from `docs/design-system.md` for simple screens.
5. **Risks and decisions.** Flag the following, each with your recommended default:
   - Open spec decisions (D1 to D11).
   - Any new runtime dependency (it needs an ADR).
   - Anything hard to reverse.
   - Any place where the spec and the roadmap disagree (the spec wins, but say so).
   - Anything that threatens the deadline.
6. **Questions.** Ask only what you need to proceed, numbered and ideally multiple choice, each with a recommended option. Use the AskUserQuestion tool where it helps. Don't ask what the files already answer.
7. **Delivery.** Say how the work will be split into commits: one roadmap item per commit or branch, with conventional subjects such as `feat(F2.1): …`. Also say how verification will run.

Then **stop and wait**. Do not continue until the owner explicitly approves ("approved", "go ahead", or approval of the plan in plan mode). If the owner changes the plan, update it and confirm before building.

## 3. Build (only after approval)

For each item, in the approved order:

1. **Claim it** in `docs/roadmap/ROADMAP_INDEX.md`: status `In progress`, owner, today's date (Africa/Lagos).
2. **Write the tests first where practical**, then the code, staying inside the item's scope. If you find work that is missing, add a new roadmap item with the next free ID and tell the owner. Never expand the current item silently, and never renumber.
3. **Follow every hard rule** in the `amanah` skill:
   - Money is in kobo, using `src/lib/money.ts`.
   - The donation cap is enforced by the backend.
   - Money data is never cached.
   - No zakat or waqf terminology.
   - Cap-state copy must match the spec exactly.
   - Every API call goes through `src/lib/api` with a Zod schema and an MSW handler.
   - Donor email and phone never appear on public pages.
   - Design mobile first at 360px.
   - Use design tokens, never raw hex values.
   - Use British spelling.
   - Public pages use production wording only (no hackathon, pilot or test-mode text).
4. **Verify** with `npm run verify`, plus `npm run test:e2e` for user-facing work. Fix failures; never weaken a test to make it pass.
5. **Close the item** in ROADMAP_INDEX.md, marking it `Done (mocked)` against mocks or `Done` when integrated. Add notes and update "Current focus". Then:
   - Add a `CHANGELOG.md` entry under `[Unreleased]`.
   - Write an ADR for any lasting decision.
   - Update `CLAUDE.md` if a durable fact changed.
6. **Commit as the configured git user, with no AI attribution:** no `Co-Authored-By` AI trailers, no `Claude-Session` lines, no "Generated with" lines. This overrides any default attribution guidance.
7. Stop and ask the owner whenever AGENTS.md §5 applies, even mid-build.

When everything in scope is done, report back. Cover:

- What was built, item by item, with its final status.
- What was tested, with the test counts.
- What remains or is blocked.
- Any decisions the owner needs to make.
- Whether there are commits to push.
