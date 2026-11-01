# ADR-008: Frontend hosting on Vercel

- **Status:** Accepted
- **Date:** 2026-10-18
- **Deciders:** Project owner
- **Related:** FRONTEND_ROADMAP F0.6 and F2.6; BACKEND_ROADMAP B12.4; ADR-001, ADR-002

## Context

The landing page (F2.6) needs a public URL that always shows the latest version: it goes into the submission document and will keep being shared. Pull requests should get preview links for review. The app is Next.js 16 with a Serwist service worker served from a route handler.

## Options considered

### Option A: Vercel

- Pros: built by the Next.js team, so every Next.js 16 feature works with no adapter, including the route handler that serves the service worker, image optimisation and Turbopack builds. Git integration gives a production deploy on every push to `main` and a preview URL per pull request. HTTPS by default, which PWA install and camera access need.
- Cons: the free Hobby plan is for non-commercial use only, so a paid plan is needed once Amanah runs commercially. There are no edge locations in Nigeria (traffic is served from the nearest region, such as Europe).

### Option B: Netlify

- Pros: similar Git workflow and preview links, with a generous free tier.
- Cons: Next.js runs through an adapter, and new Next.js features can lag behind.

### Option C: Cloudflare (Workers through OpenNext)

- Pros: large edge network, including African locations, with a generous free tier.
- Cons: needs the OpenNext adapter. Some Next.js features and Node APIs need extra setup (the service-worker route handler uses `node:child_process`).

## Decision

Option A: **Vercel**, connected to `haneefojay/amanah-frontend`.

- `main` deploys to production. Every pull request gets a preview URL.
- Environment variables are `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_APP_URL`. Until the backend exists, the deployed landing page uses only static example content.
- A custom domain is to be decided by the team. Until then the `*.vercel.app` address is used.

## Rationale

Vercel has the least friction and the lowest risk for a Next.js 16 PWA under deadline, and the owner chose it.

## Consequences

- Positive: a live link from the first push, with automatic updates and per-PR previews (closes most of F0.6).
- Negative or risks: plan limits (move to Pro before commercial use), and possible vendor lock-in through Vercel-only features, which we avoid by using standard Next.js only.
- Follow-up: the owner connects the GitHub repository in the Vercel dashboard. Add the production URL to `PROJECT.md` and `CLAUDE.md`. B12.4 decides backend hosting separately.
