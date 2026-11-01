# Architecture Decision Records

Every significant decision about Amanah (technology, architecture, process, or how a spec open decision was resolved) is recorded here as an ADR. ADRs are **append-only history**: never rewrite an accepted ADR. To change a decision, write a new ADR that supersedes the old one and update the old one's status to `Superseded by ADR-XXX`.

## Index

| ADR                                                   | Title                                                                          | Status   | Date       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ | -------- | ---------- |
| [ADR-001](./ADR-001-frontend-framework.md)            | Frontend framework: Next.js App Router with TypeScript                         | Accepted | 2026-10-18 |
| [ADR-002](./ADR-002-pwa-strategy.md)                  | PWA strategy: Serwist service worker with network-only money data              | Accepted | 2026-10-18 |
| [ADR-003](./ADR-003-frontend-backend-separation.md)   | Separate backend service and contract-first frontend development               | Accepted | 2026-10-18 |
| [ADR-004](./ADR-004-backend-stack.md)                 | Backend technology stack                                                       | Accepted | 2026-11-01 |
| [ADR-005](./ADR-005-frontend-testing-strategy.md)     | Frontend testing strategy                                                      | Accepted | 2026-10-18 |
| [ADR-006](./ADR-006-frontend-supporting-libraries.md) | Frontend supporting libraries                                                  | Accepted | 2026-10-18 |
| [ADR-007](./ADR-007-typography-and-fonts.md)          | Typography: self-hosted Schibsted Grotesk, plus Reem Kufi cut down to one word | Accepted | 2026-10-18 |
| [ADR-008](./ADR-008-hosting-vercel.md)                | Frontend hosting on Vercel                                                     | Accepted | 2026-10-18 |
| [ADR-009](./ADR-009-ui-components-shadcn.md)          | UI components on shadcn/ui                                                     | Accepted | 2026-10-18 |
| [ADR-010](./ADR-010-public-accountability-data.md)    | Public accountability data and live refresh                                    | Accepted | 2026-10-18 |

## How to add an ADR

1. Copy [`TEMPLATE.md`](./TEMPLATE.md) to `ADR-XXX-short-kebab-title.md`, using the next number (three digits, never reused).
2. Fill in every section. **Options considered** must list at least two real options with pros and cons.
3. Set the status to `Proposed` while it awaits the team, or `Accepted` once decided. Always include the decision date.
4. Add a row to the index above. Add an entry to `CHANGELOG.md`.
5. If the decision changes roadmap scope, update `docs/roadmap/ROADMAP_INDEX.md`.

## Status values

`Proposed`, `Accepted`, `Rejected`, `Deprecated`, or `Superseded by ADR-XXX`.
