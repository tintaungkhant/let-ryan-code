# Sources

Project names are anonymized (Project A, B, ...): the rules come from real client and personal projects.

Where each rule in `ryan-plan` comes from. Kept out of the skill folder so it never ships to an agent. W7 = user's planner wish in the private synthesis notes.

| Rule | Source |
|---|---|
| Small planner; local / GitHub / other store | User (W7) |
| Local tickets under `.scratch/<feature>/` | `Project A/AGENTS.md`; `Project G/CLAUDE.md`; `Project H/CLAUDE.md` |
| GitHub issues as tickets; comment pointing to the PR | `Project B/.ai/rules/agent-workflow.md`, docs-sync.md |
| Grill one question at a time, with a recommended answer; look before asking | mattpocock `grilling` skill (named by the user as the model in W7) |
| Aim for at most 10 questions; more only when needed | User (W7) |
| Linear ticket chain; lowest open ticket whose blocker is done; one at a time | `Project B/.ai/rules/agent-workflow.md` |
| A ticket is a committable step that passes checks | `Project A`, `Project B` agent-workflow.md ("chunk") |
| Confirm the ticket list before creating | User (W5: ask before important actions) |
| Rewrite ticket scope on conflict | `Project A`, `Project B` docs-sync.md |
| Tick acceptance boxes and comment when done | `Project A`, `Project B` docs-sync.md |
| Settled decisions go to `AGENTS.md` "Decisions" | `Project C backend/CLAUDE.md` (locked decisions); user (T4) |
| Park: no grill, title + context, return to work; show backlog | User (W7) |
| Discussing is not planning: answer "what if" in chat, no spec; at the end ask park / plan / decision / nothing | User (2026-11-23) |
| Plan missing prerequisites first or stop; only confirmed answers become decisions | Test run on sample app (2026-11-23) |
| A ticket can take several commits; one commit never holds two tickets | User (2026-11-23) |
| A verified ticket is done even when it cannot be committed yet (`Done in: not committed yet`) | Benchmark in Codex (2026-11-23): the ticket chain stalled for 5 calls waiting for a commit |
| `plan` shows spec and tickets in one confirmation; `ryan-implement all` builds every open ticket in one run | Benchmark in Codex (2026-11-24): the own flow fell from 441k to 130k fresh tokens (mean of 3 runs); see `bench/results/` |
| Tickets left `not committed yet` get one commit each, in order, when the user approves | Benchmark in Claude Code (2026-11-24): Ryan recommended one commit for two tickets |
