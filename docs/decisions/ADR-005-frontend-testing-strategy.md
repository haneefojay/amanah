# ADR-005: Frontend testing strategy

- **Status:** Accepted
- **Date:** 2026-10-18
- **Deciders:** Project owner (every feature must be tested); Claude (tooling)
- **Related:** spec §10 acceptance criteria; FRONTEND_ROADMAP Global Definition of Done, F0.2, F13.4

## Context

The project owner requires every feature to have tests and a Definition of Done. The demo must run flawlessly on a phone, and money logic must be exact.

## Options considered

### Option A: Vitest, React Testing Library, MSW and Playwright

- Pros: Vitest is fast and native to ESM and TypeScript; RTL tests behaviour, not implementation; MSW mocks at the network level, so the same handlers serve tests and local development; Playwright runs real mobile emulation and can test service workers, offline mode and geolocation.
- Cons: async Server Components can't be unit-tested in jsdom, so they are covered by Playwright instead.

### Option B: Jest, React Testing Library and Cypress

- Pros: very widely known.
- Cons: slower, and ESM and TypeScript setup with Next.js 16 is more friction; Cypress has weaker multi-tab and service-worker support.

## Decision

Option A, with these layers:

| Layer         | Tool                                                               | Location                   | Required for                                                                   |
| ------------- | ------------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------ |
| Unit          | Vitest                                                             | `src/**/*.test.ts`         | Pure functions, hooks, money arithmetic, validators                            |
| Component     | Vitest, RTL, MSW (jsdom)                                           | `src/**/*.test.tsx`        | Every interactive component, covering loading, empty, error and success states |
| End to end    | Playwright (Pixel 7 and Desktop Chrome) against a production build | `tests/e2e/*.spec.ts`      | Every user-facing flow, plus PWA behaviour                                     |
| Accessibility | axe (added in F1.6)                                                | in component and e2e tests | Every page                                                                     |
| Guards        | `check:terms`, lint rules                                          | `scripts/`                 | Out-of-scope terminology, float money                                          |

MSW runs with `onUnhandledFrame: "error"` so a missing mock fails the test.

## Rationale

This covers the risky parts (money, the cap UI states, offline behaviour, camera and geolocation) at the cheapest effective layer, while keeping the demo flow protected by end-to-end tests.

## Consequences

- Positive: high confidence and fast feedback. Mocks are shared between tests and development.
- Negative or risks: e2e tests need a production build (slower). CI installs Playwright Chromium.
- Follow-up: F1.6 (axe), F13.4 (full demo script spec).
