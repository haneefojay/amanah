# Amanah: frontend

Transparent Islamic donation platform. **This repository is the Next.js PWA frontend.** The backend is a separate FastAPI service in its own repository, [haneefojay/amanah-api](https://github.com/haneefojay/amanah-api) (see `docs/decisions/ADR-003` and `ADR-004`).

Start with [`PROJECT.md`](./PROJECT.md) for the overview and [`docs/roadmap/ROADMAP_INDEX.md`](docs/roadmap/ROADMAP_INDEX.md) for status.

## Prerequisites

- **Node.js 22 LTS or newer**. Check with `node -v`; install from https://nodejs.org if needed.
- **Git**. Check with `git --version`.
- VS Code is recommended. Accept the recommended extensions when prompted.

## First-time setup (Windows PowerShell, macOS or Linux)

```bash
npm install
copy .env.example .env.local      # Windows (on macOS or Linux: cp .env.example .env.local)
npx playwright install chromium   # browser for end-to-end tests (one time)
npm run verify                    # format, lint, types, terminology, unit tests, build
```

## Daily development

```bash
npm run dev:mock     # mock API on :4000 and the app on http://localhost:3000
```

Open http://localhost:3000. On your phone (same Wi-Fi), use `http://<your-PC-IP>:3000`. Camera and location features (F8) need HTTPS on a real phone; use the preview deployment or `next dev --experimental-https`.

The service worker is **disabled in development**. To try the PWA (install, offline):

```bash
npm run build && npm run start
```

## Component showcase

In development, open http://localhost:3000/dev/ui to see every UI component (not available in production). Design rules are in `docs/design-system.md`.

## Screenshots

`npm run screenshots` saves full-page landing page screenshots (phone and desktop) to `screenshots/`. It builds and starts the app automatically.

## Testing

| Command                 | Runs                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| `npm test`              | Unit and component tests (Vitest, RTL, MSW)                                                     |
| `npm run test:watch`    | The same, in watch mode                                                                         |
| `npm run test:coverage` | With a coverage report in `coverage/`                                                           |
| `npm run test:e2e`      | Playwright on mobile and desktop against a production build (starts the mock API automatically) |

## Project documentation

| File                      | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `docs/amanah-mvp-spec.md` | Product specification                               |
| `docs/roadmap/`           | Frontend and backend roadmaps, and the status index |
| `docs/decisions/`         | Architecture Decision Records                       |
| `AGENTS.md` / `CLAUDE.md` | Guides for AI agents and contributors               |
| `CHANGELOG.md`            | Change history                                      |
