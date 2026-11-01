# ADR-002: PWA strategy is a Serwist service worker with network-only money data

- **Status:** Accepted
- **Date:** 2026-10-18
- **Deciders:** Project owner (PWA requirement); Claude (tooling choice, open to review)
- **Related:** spec §4.2, §7 (in-app evidence capture), §9 (mobile-first); FRONTEND_ROADMAP F0.3, F8.3, F12; ADR-001

## Context

The project owner requires Amanah to be a Progressive Web App: installable, app-like, resilient on poor connections. However, the donation cap (spec §4.2) depends on an accurate, live `available` amount. A cached "remaining amount" could mislead a donor, so caching must never apply to money data.

## Options considered

### Option A: Serwist (`@serwist/turbopack`)

- Pros: maintained successor to `next-pwa` and Workbox-based; recommended by the Next.js PWA guide; works with Turbopack through a route handler; precaching, runtime caching, offline fallback and background sync built in.
- Cons: the Turbopack integration is a workaround (route handler at `/serwist/[path]`); it is **not compatible with Next.js `cacheComponents`**, so that option is turned off.

### Option B: A hand-written service worker in `public/`

- Pros: no dependency; full control.
- Cons: no precache manifest of hashed build assets; we would re-implement cache versioning, expiry and fallbacks. Too costly for the deadline.

### Option C: Manifest only (no service worker)

- Pros: simplest. Chrome can still prompt to install.
- Cons: no offline fallback, no asset caching on slow networks, no offline evidence queue (F8.3).

## Decision

- Use **Serwist via `@serwist/turbopack`**: worker source in `src/app/sw.ts`, served from `/serwist/sw.js`, registered by `SerwistProvider` in `src/app/providers.tsx`.
- Use **Next.js built-in `app/manifest.ts`** for the web app manifest, with 192px, 512px and maskable icons generated from `public/icons/icon.svg` (`npm run icons`).
- **Caching rules:**
  - `/api/*`, and later the backend API origin, is **NetworkOnly**: money, donation, checkout and admin data are never cached;
  - static assets use Serwist's `defaultCache` (cache-first or stale-while-revalidate);
  - documents fall back to `/~offline` when the network fails.
- Enable `experimental.useOffline` for the connectivity banner and automatic retry of failed navigations.
- Turn **off** `cacheComponents` and `partialPrefetching` (create-next-app defaults) because of the Serwist incompatibility. Revisit when Serwist supports them.
- Disable the service worker in development so it never serves stale code.

## Rationale

Serwist gives a production-grade PWA in minutes and is the option referenced by the Next.js documentation. Keeping money data network-only preserves the integrity of the donation cap, which matters more than offline convenience.

## Consequences

- Positive: installable app, offline fallback page, and faster repeat loads on slow networks. Verified by e2e tests (`tests/e2e/pwa.spec.ts`).
- Negative or risks: the PWA only behaves fully in production builds, so PWA e2e tests run against `next build && next start`. Turning off Cache Components forgoes some Next.js 16 rendering optimisations.
- Follow-up: F12.1 to F12.4 (install prompt, update flow, caching review, offline-aware actions), and F8.3 (offline evidence queue). When the backend runs on a separate origin, add a NetworkOnly matcher for that origin (F12.3).
