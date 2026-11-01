# AGENTS.md: how agents work on Amanah

This file is the operating guide for **any** AI coding agent (Claude, Codex, Cursor, Copilot and others) and for human contributors. **Claude: also read [`CLAUDE.md`](./CLAUDE.md)**, which holds project memory and Claude-specific instructions and takes precedence where the two differ.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

## 1. Start of every session

0. This is the **frontend** repository. The backend lives in [haneefojay/amanah-api](https://github.com/haneefojay/amanah-api); its roadmap and ADRs are the source of truth for `B…` items.
1. Read [`CLAUDE.md`](./CLAUDE.md) (project memory and standing instructions). Agents that support skills: load `.claude/skills/amanah/SKILL.md` — it condenses the project and domain rules.
2. Read [`docs/roadmap/ROADMAP_INDEX.md`](docs/roadmap/ROADMAP_INDEX.md): current focus, milestones, status board and blockers.
3. Skim the latest entries in [`CHANGELOG.md`](./CHANGELOG.md) to see what changed recently.
4. For the item you'll work on, read its full entry in [`FRONTEND_ROADMAP.md`](docs/roadmap/FRONTEND_ROADMAP.md) or [`BACKEND_ROADMAP.md`](docs/roadmap/BACKEND_ROADMAP.md), the spec sections it cites, and any related ADRs in [`docs/decisions/`](docs/decisions/README.md).

## 2. Doing the work

Follow the workflow in ROADMAP_INDEX §1:

- **Claim** the item (status `In progress`, owner, date).
- **Tests first where practical.** Every feature needs the tests listed in its roadmap entry. No feature is done without passing tests.
- **Meet the Definition of Done:** the roadmap's Global Definition of Done plus the item's own.
- **Stay in scope.** Build what the item describes. If you discover missing work, add a new roadmap item (next free ID) rather than expanding the current one.
- **Small, reviewable changes.** One roadmap item per branch or PR. The branch or PR title includes the ID, for example `feat/F3.2-items-table`.

## 3. Finishing the work

1. `npm run verify` passes (format, lint, types, terminology, unit tests, build).
2. `npm run test:e2e` passes for user-facing changes.
3. Update the item in **ROADMAP_INDEX.md** (status, notes, date) and its "Current focus" section.
4. Add a **CHANGELOG.md** entry under `[Unreleased]` (Added, Changed, Fixed, Removed, Decisions).
5. If you made a decision with lasting impact, write an **ADR** (next number) in `docs/decisions/` and add it to the index there.
6. Commit as the configured git user. Do **not** add AI attribution (no `Co-Authored-By` AI trailers, no "Generated with …" lines) to commits or PRs.
7. Summarise for the user what changed, what was tested, and anything that needs their decision.

## 4. Project rules (non-negotiable)

| Rule                                                                                | Why                        | How it is enforced                           |
| ----------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------- |
| Money is **integer kobo** only. Use `src/lib/money.ts`                              | Spec §9: no floating point | ESLint bans `parseFloat`; unit tests         |
| The donation cap is enforced by the **backend**. The frontend only reflects it      | Spec §4                    | Code review; e2e tests                       |
| **Never cache money data** in the service worker                                    | ADR-002                    | `/api/*` NetworkOnly in `src/app/sw.ts`      |
| **No zakat or waqf terminology** in the product                                     | Spec §1                    | `npm run check:terms` in CI                  |
| All API calls go through `src/lib/api` with a **Zod schema** and an **MSW handler** | ADR-003                    | Code review; MSW `onUnhandledFrame: "error"` |
| **No secrets in the frontend.** Only `NEXT_PUBLIC_*` values, none of them secret    | Spec §9                    | Code review; `.env*` gitignored              |
| Public pages **never show donor email or phone**                                    | NDPA, spec §9              | E2E privacy test (F4.6)                      |
| **Mobile first:** works at 360px width on a mid-range Android phone                 | Spec §9                    | Playwright `mobile-chrome` project           |
| Accessible: labels, keyboard, contrast, axe clean                                   | Quality                    | axe tests (F1.6 onwards)                     |
| Don't renumber roadmap IDs or ADRs                                                  | Traceability               | Review                                       |

## 5. When to stop and ask the user

- Anything touching an **open decision** (spec §11: D1 to D11) beyond the documented default, or any change to the API contract that the backend repository ([haneefojay/amanah-api](https://github.com/haneefojay/amanah-api)) has not agreed.
- Anything **hard to reverse**: deleting data or files, changing the money or cap model, rewriting git history, changing the deployment target.
- Adding a **new runtime dependency** that isn't in an ADR. Propose it first, or write a `Proposed` ADR.
- When the spec and a roadmap entry disagree. The spec wins, but flag it.

## 6. Repository map

```
src/
  app/                 Next.js App Router routes, layouts, manifest, service worker (sw.ts)
    serwist/[path]/    Route handler that builds and serves the service worker
    ~offline/          Offline fallback page
  components/
    ui/                Design-system components (F1)
    pwa/               PWA-specific UI (offline banner, install prompt, update toast)
  features/            Feature modules, one folder per roadmap area (campaigns, checkout, ...)
  lib/                 Framework-agnostic helpers: money, env, cn, api client and schemas
  mocks/               MSW handlers and fixtures (tests and `npm run mock:api`)
  test/                Test setup and render helpers
tests/e2e/             Playwright specs (run against a production build)
scripts/               Mock API server, terminology guard, icon generator
docs/                  Spec, roadmaps, decisions (ADRs)
.claude/skills/        Skills for Claude (see its README)
```

## 7. Commands

| Command                           | What it does                                                        |
| --------------------------------- | ------------------------------------------------------------------- |
| `npm run dev`                     | Next.js dev server (http://localhost:3000)                          |
| `npm run dev:mock`                | Mock API (port 4000) and the dev server together                    |
| `npm run mock:api`                | Mock API only                                                       |
| `npm run verify`                  | Format check, lint, typecheck, terminology check, unit tests, build |
| `npm test` / `npm run test:watch` | Unit and component tests                                            |
| `npm run test:coverage`           | Tests with a coverage report                                        |
| `npm run test:e2e`                | Playwright end-to-end tests (builds the app first)                  |
| `npm run format`                  | Prettier write                                                      |
| `npm run icons`                   | Regenerate PWA icons from `public/icons/icon.svg`                   |
