# Amanah

> **Amanah** (أمانة) means trust: the obligation to safeguard what is placed in one's care.

Amanah is a transparent Islamic donation platform. Verified Islamic organisations (mosques, orphanages, Islamic societies, community groups) publish specific, itemised needs. Donors give to those needs and follow exactly how the money is spent through a live accountability page: receipts, photos, and independent witness confirmation.

## Why

Entry for the **AMETTSA Inter-Varsity Innovation Challenge** (AMETTSA 5.0 Annual Convention, Summit University, Offa, Kwara State).

- Submission deadline: **1 November 2026**
- Live demo: convention date `[PLACEHOLDER]`

## What makes it different

1. **The system enforces the donation cap, not just a policy.** An organisation can never receive more than its stated target. Concurrent donations are handled with database reservations (spec §4).
2. **Accountability is public by default.** Every campaign page shows target, raised, spent, receipts, geotagged evidence photos and witness confirmations.
3. **Independent witnesses.** A respected community member who is not an admin of the organisation confirms or disputes delivery.
4. **Mobile-first PWA.** Installable, fast on mid-range Android phones and slow networks, with in-app camera and location capture for evidence.

## Hard boundaries

- **General donations only.** Zakat and waqf are permanently out of scope and must not appear anywhere in the product (enforced by `npm run check:terms`).
- **Test-mode payments only** for the MVP (Paystack test mode).
- **When in doubt, cut scope.**

## Users

| Role               | Does                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| Donor (guest)      | Browses, donates, follows accountability                                        |
| Organisation admin | Creates campaigns, logs expenses and evidence, posts updates, assigns witnesses |
| Witness            | Confirms or disputes delivery per item                                          |
| Platform admin     | Verifies organisations, reviews campaigns, resolves excess, audits              |

## Architecture at a glance

```
┌──────────────────────────────┐        HTTPS / JSON        ┌───────────────────────────┐
│  Frontend (this repository)  │  ───────────────────────►  │  Backend API service      │
│  Next.js 16 App Router, PWA  │   src/lib/api + Zod        │  FastAPI (ADR-004)        │
│  Tailwind · TanStack Query   │  ◄───────────────────────  │  PostgreSQL · MinIO       │
└──────────────────────────────┘                            └───────────────────────────┘
          ▲ dev: the real backend (amanah-api); unit tests: MSW stubs
```

## Repositories

| Part                 | Repository                               |
| -------------------- | ---------------------------------------- |
| Frontend (this repo) | https://github.com/haneefojay/amanah     |
| Backend (FastAPI)    | https://github.com/haneefojay/amanah-api |

## Where things live

| Path                      | Purpose                                                             |
| ------------------------- | ------------------------------------------------------------------- |
| `docs/amanah-mvp-spec.md` | The product specification (source of truth for requirements)        |
| `docs/roadmap/`           | Frontend roadmap, backend roadmap and **ROADMAP_INDEX.md** (status) |
| `docs/decisions/`         | Architecture Decision Records (ADR-001 onwards)                     |
| `AGENTS.md`               | How any AI agent or contributor works on this project               |
| `CLAUDE.md`               | Claude-specific memory and instructions                             |
| `CHANGELOG.md`            | Every notable change, newest first                                  |
| `README.md`               | Developer setup and commands                                        |
| `.claude/skills/`         | Skills available to Claude for this project                         |

## Status

See [`docs/roadmap/ROADMAP_INDEX.md`](docs/roadmap/ROADMAP_INDEX.md).
