# Claude skills for Amanah

Project-level skills live here, one folder per skill, each with a `SKILL.md`. Claude loads a skill when its description matches the task. **Start with `amanah`**: its rules take precedence over every other skill, and its [design skills guide](./amanah/references/design-skills-guide.md) says which design skill to use for which job.

## Installed

| Skill | Source | Purpose on Amanah | Needs |
| --- | --- | --- | --- |
| `amanah` | This project | Project rules, domain rules, frontend conventions, workflow, design-skill routing | — |
| `impeccable` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Main design skill for product screens (build, critique, polish, harden) | Downloads its helper binary from the official GitHub releases on first run |
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Searchable UX guidelines, palettes, font pairings, accessibility checks | Python 3 |
| `design-taste-frontend` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | Art direction for landing/marketing surfaces only (not dashboards) | Node 22+, Chrome or Edge |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) (official) | Design planning for new surfaces and UX-writing guidance | — |
| `agent-browser` | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | Drive a real browser to check pages and dogfood flows | `npm i -g agent-browser && agent-browser install` |
| `emil-design-eng`, `animate`, `animation-vocabulary`, `animation-performance`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `apple-design`, `mobile-native`, `break-ui`, `pick-ui-library`, `prototype`, `ask-sonner` | [emilkowalski/skill](https://github.com/emilkowalski/skill) | Polish, motion, native feel on mobile, worst-case data testing, library picks | — |

Not installed from those repositories, on purpose: `write-swift` and `animate-expo` (native iOS / React Native), the other taste-skill variants (`-v1`, `-v2-experimental`, brutalist, soft, minimalist and image-generation skills), and the ui-ux-pro-max companions (`banner-design`, `slides`, `brand`, `design`, `design-system`, `ui-styling`). Add any of them later with `npx skills add <repo> --skill <name> --agent claude-code --copy`.

## Managing skills

- Installed with the [`skills`](https://www.npmjs.com/package/skills) CLI using `--agent claude-code --copy` (copies, not symlinks, so it works on Windows). Sources and content hashes are pinned in `skills-lock.json` at the repo root.
- Update: `npx skills update --project`. Review the diff before committing; skills are instructions Claude will follow.
- Third-party skill folders are excluded from Prettier and ESLint so their files are kept exactly as published.
- Edit the `amanah` skill whenever a project rule changes, in the same change as the rule (and note it in `CHANGELOG.md`).
