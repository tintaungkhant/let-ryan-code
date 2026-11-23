# Sources

Project names are anonymized (Project A, B, ...): the rules come from real client and personal projects.

Where each rule in `ryan-wake-up` comes from. Kept out of the skill folder so it never ships to an agent. Theme (T) and wish (W) ids refer to the private synthesis notes. "User" = stated by the user while reviewing the synthesis.

## templates/rules/autonomy.md

| Rule | Source |
|---|---|
| yes / no / flexible answers and the action table | User (W4); T6, T9, T11, T10, T12 decisions |
| Ask before important or very costly actions, whatever the answer | User (W5, T11) |
| Keep actions reversible; back up first | User (W5); `Project E/CLAUDE.md` "Flag big git mutations" |
| Leave no processes running; print the commands | User (W1); `Project F/AGENTS.md` "Never launch the app" |
| Use the right tool; ask to install a missing one | User (W6) |
| Save tokens | `Project B2/.ai/rules/workflow.md`; user (W3) |
| Disagreeing with the user | `Project F/AGENTS.md` "How to disagree"; `Project D/.ai/rules/engineering.md` "Collaboration and pushback" |
| Subagent brief (yes) | `Project D/.ai/rules/engineering.md` "Subagent delegation"; `Project B/.ai/rules/agent-workflow.md` |
| Subagents: model by complexity, ambiguity and expected retries (small for mechanical work, mid for judgment), ask before the top model, move up a model after a failure instead of rerunning; full precise brief from main agent; delegate only when it saves tokens; main agent verifies all subagent work cheaply (checks, diff --stat, done-checks; no full re-read) | User (2026-11-23), user feedback on retry cost (2026-11-23) |
| No subagents, run delegated steps inline (no) | `Project A/.ai/rules/agent-workflow.md`; `Project E/CLAUDE.md` |
| `.env` read yes/no; on no, work from `.env.example` and code usage | User (2026-11-23) |

## templates/rules/engineering.md

| Rule | Source |
|---|---|
| Think as a domain expert: terms, flows, common issues (CRM example) | User (2026-11-23) |
| Light on modest hardware, sized to real load, not to a tiny server | User (2026-11-23) |
| Junior-readable code; no abstractions to show off; not copy-paste either | User (2026-11-23) |
| SOLID, clean code, DRY, YAGNI, design patterns; simpler code wins a conflict | User (2026-11-23); `Project E/CLAUDE.md` DRY, YAGNI |
| Readable code over comments; comment only the why | User (2026-11-23) |
| Build only what the task needs; lazy means less code, not less care | `Project A`, `Project B` `.ai/rules/engineering.md`; `Project E/CLAUDE.md` YAGNI |
| Safety and integrity are current requirements | `Project D/.ai/rules/engineering.md` |
| Extract on second real use; similar syntax ≠ shared meaning; one implementation per business rule | `Project B/.ai/rules/engineering.md`; `Project D/.ai/rules/engineering.md`; `Project E/CLAUDE.md` DRY |
| Framework → dependencies → package; say why when hand-rolling | `Project D`, `Project A`, `Project B` engineering rules; `Project E`, `Project C`, `Project B2` |
| Read installed docs; trust repo docs and `git log` over memory | Next.js `nextjs-agent-rules` block (10 projects); `Project J/CLAUDE.md`; `Project F/AGENTS.md`; `Project D` engineering.md |
| Use the framework generator | `Project C backend/CLAUDE.md`; `Project I CMS/CLAUDE.md` |
| Server-side validation; endpoints are public; no client-derived values | `Project A/.ai/rules/server-actions.md`; `Project B/.ai/rules/server-actions.md`; `Project I CMS/CLAUDE.md`; `Project C backend/CLAUDE.md` |

## templates/rules/verification.md

| Rule | Source |
|---|---|
| Report only what you verified; name checks run and skipped | `Project D/.ai/rules/delivery.md`; `Project B/apps/brain/prompts/agent.md` |
| Never weaken a failing check | `Project D/.ai/rules/delivery.md` |
| Test style options (TDD / tests / typecheck gate) | `Project D` delivery.md, `Project F/AGENTS.md`; `Project E/CLAUDE.md`; `Project C frontend/CLAUDE.md` |
| Behavior not visuals; distinct defect; keep existing tests | `Project D/.ai/rules/delivery.md`; `Project A`, `Project B` testing.md |
| Prefer non-visual proof | `Project D/.ai/rules/delivery.md`; user (T10) |
| Tell the user what to open and what to look for | `Project A`, `Project B` `.ai/rules/testing.md` |
| No real sends; no non-test database | `Project B/.ai/rules/testing.md`; `Project D/.ai/rules/delivery.md` |

## templates/rules/git.md

| Rule | Source |
|---|---|
| Explicit-path staging; only your files | `Project B2/.ai/rules/workflow.md`; `Project D/.ai/rules/delivery.md` |
| One coherent step per commit that passes checks; change + tests + docs together | `Project A`, `Project B` agent-workflow.md; `Project D` delivery.md |
| Attribution option | `Project F/AGENTS.md`; `Project C backend/CLAUDE.md`; user (T9) |
| Always Conventional Commits `type(scope):`, short title; title-only vs title+body choice | User (2026-11-23); `Project F/AGENTS.md`; `Project C backend/CLAUDE.md` |
| Check branch first; branch per AGENTS.md / user, ask when unsure | User (2026-11-23) |
| Ticket ID at the end of the commit title | User (2026-11-23), approved suggestion |
| No secrets in code, docs or commits | User (2026-11-23), approved suggestion |
| Worktrees only under `.worktree/` in the project, gitignored, removed after merge | User (2026-11-23) |

## templates/rules/docs.md

| Rule | Source |
|---|---|
| Keep docs true; update when described behavior changes; label vs table example | `Project D/.ai/rules/delivery.md`; `Project F/AGENTS.md`; user (T8) |
| One home per topic | `Project B/.ai/rules/docs-sync.md` |
| Check docs before finishing | `Project A`, `Project B` docs-sync.md |
| Update or delete untrue docs; no archive | User (T8); `Project F/AGENTS.md` "Don't design against ... an archived spec" |
| No diary files | `Project D/.ai/rules/delivery.md` |
| Decisions with dated strike-through; out of scope list | `Project C backend/CLAUDE.md`; `Project C frontend/CLAUDE.md` |
| Generated files list with regenerate command | `Project E web/CLAUDE.md`; `Project C frontend/CLAUDE.md`; `Project D/.ai/guidelines/project.md` |

## templates/AGENTS.md and CLAUDE.md

| Item | Source |
|---|---|
| `CLAUDE.md` = `@AGENTS.md` | `Project F`, `Project G`, `Project I profile`, `Project D`, `Project J`, `Project B2` |
| `.ai/rules/` one topic per file, `Applies to:` line, "When unsure whether a file applies, read it" | `Project A/AGENTS.md`; `Project B` rules; `Project D/.ai/rules/index.md` |
| `docs/` only | User (T8) |
| Planner section: discussing is not planning; end-of-discussion ask (park / plan / decision / nothing) | User (2026-11-23) |

## SKILL.md steps

| Step | Source |
|---|---|
| Back up before writing | User (W5) |
| Deploy: `deploy_owner` (later / we / devops), `.ai/deployment.md` + gitignored `.ai/credentials.md`, `commit_deployment`, `ryan-ship` to set it up later | User (2026-11-23): credentials.md + deployment.md workflow, devops case, code first |
| Prefer CLI login / alias / profile over raw secrets; no credentials in subagent briefs | User (2026-11-23), approved suggestion |
| Re-run: saved answers in `.ai/setup-answers.md`, ask only changes, keep user-added lines | User (2026-11-23), approved suggestion |
| Keep tool-managed marker blocks | Next.js block text: `next dev` re-creates it (`Project G`, `Project K`) |

## Tool compatibility (checked 2026-11-23 against official docs)

| Item | Source |
|---|---|
| Skill folders: Claude `~/.claude/skills`; Codex `~/.agents/skills`; OpenCode `~/.agents/skills` + `~/.claude/skills`; Antigravity `~/.gemini/config/skills` | code.claude.com/docs/en/skills; learn.chatgpt.com/docs/build-skills; opencode.ai/docs/skills; antigravity.google/docs/skills |
| User-only: `disable-model-invocation` (Claude, OpenCode); `agents/openai.yaml` `policy.allow_implicit_invocation: false` (Codex); none in Antigravity, so the description says so | same |
| Question tools: `AskUserQuestion` (Claude), `question` (OpenCode), `ask_question` (Antigravity); Codex: chat | opencode.ai/docs/tools; antigravity.google/docs/hooks |
| `AGENTS.md` read natively by Codex, OpenCode, Antigravity; Claude via `CLAUDE.md` `@AGENTS.md` | learn.chatgpt.com/docs/agent-configuration/agents-md; opencode.ai/docs/rules; antigravity.google/docs/rules |
