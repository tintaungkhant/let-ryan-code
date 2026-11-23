# Example: tiny-crm

Real output from let-ryan-code on a tiny Next.js CRM (a `package.json` with `typecheck`, `lint` and `test` scripts, a `.env.example`, and a `.env` the agent was told not to read). Nothing here was written by hand.

| Step | Command | Wrote |
|---|---|---|
| 1 | `ryan-wake-up` | `AGENTS.md`, `CLAUDE.md`, `.ai/rules/*`, `docs/README.md`, `.ai/setup-answers.md`, `.gitignore` lines (shown as `example.gitignore`, so this repo does not apply it) |
| 2 | `ryan-ship` ("we deploy", Vercel) | Deploy section in `AGENTS.md`, `.ai/deployment.md` (and a gitignored `.ai/credentials.md`, not included here) |
| 3 | `ryan-remember CSV import for contacts` | `.scratch/backlog.md` |
| 4 | `ryan-plan` "plan contact tags" | `.scratch/contact-tags/01..03`, four lines in `AGENTS.md` "Decisions" |
| 5 | `ryan-next` | Worked ticket 01; left it open because the checks could not run without `node_modules` |

The setup answers are in `.ai/setup-answers.md`.
