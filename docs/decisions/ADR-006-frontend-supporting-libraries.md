# ADR-006: Frontend supporting libraries

- **Status:** Accepted
- **Date:** 2026-10-18
- **Deciders:** Project owner (agreed with the proposed choices); Claude
- **Related:** spec §9; FRONTEND_ROADMAP F0, F1, F4.2

## Context

With the framework fixed (ADR-001), the frontend needs choices for styling, server-state fetching, forms and validation, package management and fonts. These should be small, well-supported and fast on low-end phones.

## Options considered and decisions

| Concern                 | Chosen                                                                                            | Alternatives considered                  | Why                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Styling                 | **Tailwind CSS v4** with design tokens in `@theme` (`globals.css`)                                | CSS Modules; styled-components           | Fast to build, tiny CSS output, tokens in one place, no runtime cost                                         |
| UI primitives           | **Undecided.** _Decided in [ADR-009](./ADR-009-ui-components-shadcn.md): shadcn/ui_               | shadcn/ui (Radix); Headless UI           | Decide in F1.2 with a new ADR. shadcn/ui is the leading candidate for accessible dialogs, sheets and selects |
| Server state            | **TanStack Query v5**                                                                             | SWR; plain `fetch` with `useEffect`      | Polling for live accountability (F3.7), retries, cache invalidation after mutations                          |
| Forms                   | **react-hook-form** with **Zod** (`@hookform/resolvers`)                                          | Formik; native forms with server actions | Minimal re-renders on low-end devices. Zod schemas are shared with API validation                            |
| Validation and contract | **Zod v4**                                                                                        | Valibot; io-ts                           | Same schemas validate API responses (ADR-003) and forms                                                      |
| Class merging           | `clsx` with `tailwind-merge` (`cn()`)                                                             | none                                     | Standard pattern for composable components                                                                   |
| Fonts                   | **System font stack**. _Superseded by [ADR-007](./ADR-007-typography-and-fonts.md) on 2026-10-18_ | Inter via `next/font`                    | Zero font download on slow connections                                                                       |
| Package manager         | **npm**                                                                                           | pnpm; yarn                               | Ships with Node, simplest on Windows                                                                         |
| Node.js                 | **22 LTS or newer** (`.nvmrc`, `engines`)                                                         | 20                                       | Required by current tooling                                                                                  |
| TypeScript              | **5.9** (pinned `~5.9`)                                                                           | 7.0                                      | The typescript-eslint ecosystem doesn't yet support 6.1 and later                                            |

## Consequences

- Positive: a small, coherent toolset that agents and contributors can learn quickly.
- Negative or risks: TypeScript is pinned below the latest major version until typescript-eslint supports it (revisit in a future ADR).
- Follow-up: F1.2 (UI primitives ADR).
