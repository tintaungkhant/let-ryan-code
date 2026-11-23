# Test scenarios

Run each scenario in a throwaway project (a small app in its own git repo). Then check the expected result by hand, and run `node tests/validate.mjs --project <dir>` after any `ryan-wake-up` scenario.

| # | Command or prompt | Setup | Expected |
|---|---|---|---|
| 1 | `ryan-wake-up` | Fresh project with `package.json` scripts and a `.env` holding a fake secret | `AGENTS.md`, `CLAUDE.md`, 5 rule files, `docs/README.md`, `.ai/setup-answers.md` written; no `{{` left; `.env` never opened and the fake secret appears nowhere |
| 2 | `ryan-rethink`, change one answer | Project from #1, plus a line you added to a rule file and a decision in `AGENTS.md` | Only the changed question asked; only affected files rewritten and backed up; your added line and decision kept |
| 3 | "what if we moved off Vercel to a VPS?" | Project from #1 | Answer in chat only; no file created; ends with one line asking park / plan / decision / nothing |
| 4 | `ryan-remember CSV import for contacts` | Project from #1 | One backlog line with context and date; no questions |
| 5 | `ryan-plan` "plan contact tags" | Project from #1 | At most 10 questions, each with a recommended answer; asks about missing pieces instead of assuming them; linear ticket chain saved after confirmation; confirmed answers in "Decisions" |
| 6 | `ryan-ship`, answer "we deploy" | Project from #1 | Deploy section in `AGENTS.md`, `.ai/deployment.md`, `.ai/credentials.md`; `credentials.md` gitignored |
| 7 | `ryan-next` | Project from #5 | Ticket 01 picked; checks from `AGENTS.md` run before boxes are ticked; done with the commit only when every box is verified, otherwise left open with the reason |

All 7 scenarios passed on 2026-11-23 in Claude Code, run by an agent with preset answers. Codex, OpenCode and Antigravity are not run yet.
