# Frontend conventions

Stack (ADR-001, 002, 006): Next.js 16 App Router · TypeScript 5.9 strict (`noUncheckedIndexedAccess`) · Tailwind CSS v4 · Serwist PWA · TanStack Query v5 · react-hook-form + Zod v4 · Vitest 5 + RTL + MSW 3 · Playwright.

**Next.js 16 differs from older versions.** Before using an API you are not sure about, read the guide in `node_modules/next/dist/docs/`.

## Contents

1. File layout
2. Adding an API endpoint (contract-first recipe)
3. Data fetching
4. Forms
5. Styling and components
6. PWA rules
7. Testing recipes
8. Commands

---

## 1. File layout

```
src/app/                      routes; group by area: (public), org/, witness/, admin/
src/app/sw.ts                 service worker source (Serwist)
src/components/ui/            design-system primitives (F1, shadcn/ui) — no business logic
src/components/shell/         staff-area layout: DashboardShell, role nav config
src/components/pwa/           offline banner, install prompt, update toast
src/features/<area>/          feature modules: components, hooks, schemas, tests
                              areas: campaigns, accountability, checkout, auth, org, evidence, witness, admin
src/lib/                      framework-agnostic helpers (money, env, cn)
src/lib/api/                  client.ts (apiFetch, ApiError, api.*) + schemas.ts (Zod contract)
src/mocks/                    MSW handlers + fixtures (tests and `npm run mock:api`)
src/test/                     setup.ts, render.tsx (renderWithProviders)
tests/e2e/                    Playwright specs (production build)
```

- Tests sit next to the file they test: `foo.ts` → `foo.test.ts`.
- One component per file; named exports; file names in kebab-case.
- `"use client"` only where needed (state, effects, browser APIs). Default to Server Components for public read pages.

## 2. Adding an API endpoint (contract-first recipe)

Do all four steps in the same change:

1. **Schema** in `src/lib/api/schemas.ts`: request and response Zod schemas, kobo fields as `kobo`, export inferred types.
2. **Client method** in `src/lib/api/client.ts` → `api.<name>()` calling `apiFetch(path, schema, init)`.
3. **MSW handler** in `src/mocks/handlers.ts` + fixture in `src/mocks/fixtures.ts`. Use `"*/api/..."` paths. Mock the documented error codes too (e.g. `AMOUNT_EXCEEDS_AVAILABLE`, `TARGET_REACHED`) so the UI for them can be built and tested.
4. **Tests**: client test for success + each error code + contract mismatch.

Error envelope: `{ "error": { "code": "SCREAMING_SNAKE", "message": "…" } }` → `ApiError { status, code, message }`. Branch UI on `code`, never on `message`.

When the backend publishes OpenAPI (B0.3), reconcile schemas with it; the OpenAPI document becomes the source of truth.

## 3. Data fetching

- Public read pages: fetch in Server Components via `api.*` for fast first paint, then hydrate a TanStack Query cache for live refresh where needed (F3.7).
- Client data: `useQuery({ queryKey: ["campaign", slug], queryFn: () => api.getCampaign(slug) })`. Query keys are arrays starting with the resource name.
- Live accountability: poll every 10–15 s with `refetchInterval`, paused when the tab is hidden.
- Mutations: `useMutation`, then `invalidateQueries` for affected keys. Disable submit while pending (no double charges).
- Never cache or persist money responses to storage.

## 4. Forms

- react-hook-form + `zodResolver(schema)`. The form schema can reuse API schema pieces.
- Money inputs: text field parsed with `parseNairaToKobo`; never `type="number"` (locale and float issues).
- Every field has a visible `<label>`, hint and error text linked with `aria-describedby`.
- Server errors map to field errors or a form-level alert by error `code`.

## 5. Styling and components

- Tailwind utilities with tokens from `src/app/globals.css` `@theme`: `brand-*`, `gold-*`, `sand-*`, `ink-*`, `danger-600`, `warning-600`, `success-600`. **No raw hex in components.**
- Merge classes with `cn()` from `src/lib/cn.ts`.
- Fonts (ADR-007): `--font-sans` is Schibsted Grotesk, self-hosted via `next/font/local` (`src/app/fonts.ts`). `--font-arabic-display` is a Reem Kufi subset containing **only** the glyphs of أمانة, so any other Arabic text needs a regenerated subset and the user's approval. No other web fonts.
- Mobile first: design at 360px, then `sm:`/`md:` up. Respect safe areas (`env(safe-area-inset-*)`), use `min-h-dvh` not `100vh`.
- Touch targets ≥ 44×44 px. Inputs ≥ 16px font (prevents iOS zoom).
- `prefers-reduced-motion` is already respected globally; motion must still make sense without it.
- Use `src/components/ui` primitives (shadcn/ui, ADR-009), listed in `docs/design-system.md` and shown on `/dev/ui`. Add new ones from the shadcn new-york-v4 registry with the same adaptations (tokens, 44px targets, 16px inputs), never inside features. Money UI: `MoneyAmount`, `NairaInput` with `useNairaInput`. Status wording: `src/lib/status.ts`.

## 6. PWA rules (ADR-002)

- Service worker is **production-only**; test PWA behaviour with `npm run build && npm run start` or the e2e suite.
- API and the backend origin: NetworkOnly. Static assets: Serwist `defaultCache`. Documents: offline fallback `/~offline`.
- `useOffline()` from `next/offline` drives offline UI. Every mutation is disabled or queued while offline (F12.4) — never fails silently.
- Don't auto-reload during checkout or upload when a new SW version is waiting (F12.2).
- `cacheComponents` stays **off** (Serwist incompatibility).
- Manifest: `src/app/manifest.ts`; icons regenerate from `public/icons/icon.svg` with `npm run icons`.

## 7. Testing recipes

Required per feature (Global DoD): unit tests for logic, component tests for every interactive component (loading / empty / error / success), one mobile Playwright test per user flow.

Component test with MSW override:

```tsx
import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import { server } from "@/mocks/node";
import { renderWithProviders } from "@/test/render";

it("offers the remaining amount when the request exceeds it", async () => {
  server.use(
    http.post("*/api/campaigns/:id/checkout", () =>
      HttpResponse.json(
        { error: { code: "AMOUNT_EXCEEDS_AVAILABLE", message: "…" }, availableAmount: 20_000_000 },
        { status: 409 },
      ),
    ),
  );
  renderWithProviders(<CheckoutForm campaignId="…" />);
  // …act…
  expect(await screen.findByRole("button", { name: "Give ₦200,000 instead" })).toBeVisible();
});
```

- Query by role and accessible name first; avoid test IDs unless nothing else works.
- MSW runs with `onUnhandledFrame: "error"`: an unmocked request fails the test — add the handler.
- Fake timers for polling and reservation countdowns.
- Playwright: projects `mobile-chrome` (Pixel 7) and `desktop-chrome`; geolocation via `context.setGeolocation`, offline via `context.setOffline`, files via `setInputFiles`.
- Money tests: assert exact strings (`"₦200,000"`) and integer kobo payloads.

## 8. Commands

`npm run dev:mock` (mock API :4000 + app :3000) · `npm run verify` · `npm test` · `npm run test:watch` · `npm run test:coverage` · `npm run test:e2e` · `npm run check:terms` · `npm run format` · `npm run icons`
