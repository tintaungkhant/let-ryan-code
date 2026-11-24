# let-ryan-code

[![validate](https://github.com/tintaungkhant/let-ryan-code/actions/workflows/validate.yml/badge.svg)](https://github.com/tintaungkhant/let-ryan-code/actions/workflows/validate.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Talk to Ryan, your coding agent. One set of agent rules and a small planner for Claude Code, Codex, OpenCode and Antigravity, distilled from 30 AI-driven projects (personal and company).

```
/ryan-wake-up     set this project up
/ryan-spec        a few questions, then a one-screen spec
/ryan-tickets     split the spec into tickets
/ryan-implement   build the next ticket (or 02, or all)
/ryan-status      what's next
/ryan-talk        just discuss, no spec
```

## Why

Coding agents out of the box:

- **write a spec when you only asked "what if…?"** Ryan answers in chat, then asks once: park it, plan it, record a decision, or nothing.
- **ask permission for everything, or for nothing.** Ryan asks you once at setup: for installs, commits, pushes, deploys and paid runs, answer *yes*, *no* or *flexible*.
- **say "done" without proof.** Ryan reports only checks it ran, never weakens a failing test, and leaves a ticket open when a box is not verified.
- **burn tokens.** Rules load only when a task touches them, subagents get the model that gets the job right the first time (not just the cheapest) and a precise brief, and a 30-question grill becomes about 10.
- **leave a mess.** No background dev servers, no detached containers, worktrees only inside the project, a backup before any risky change.

Every rule traces to a real project or a decision; see [docs/sources](docs/sources).

## Benchmark

Same tasks, same Codex model, fresh copy of a small app each run, hidden tests run afterwards. Means of 3 runs each:

| Task | none | ryan | matt |
|---|---|---|---|
| Plan and build a feature with each setup's own commands | – | 24/24 tests, 130k tokens, 3.9 min | 24/24 tests, 314k tokens, 11.4 min |
| Same feature, plain prompt | 24/24, 59k | 24/24, 52k | 24/24, 50k |
| Bug fix, refactor, risky migration, what-if (4 tasks) | all checks pass | all checks pass | all checks pass |

Tokens are fresh (uncached) tokens. Correctness and safety tie on these tasks; Ryan's edge is cost on bigger work. On small coding tasks it costs about 6k more for reading its rules and keeping tests and docs current. Full table, method and limits: [bench/results/2026-11-24-codex.md](bench/results/2026-11-24-codex.md).

## Quick start

```bash
npx skills add tintaungkhant/let-ryan-code -g
```

Pick your agents when asked. The picker pre-ticks only the agents that share `~/.agents/skills` (Codex, OpenCode, Cursor, …); tick **Claude Code** and **Antigravity** yourself if you use them.

Or skip the picker and name your agents:

| For | Command |
|---|---|
| Claude Code, Codex, OpenCode, Antigravity | `npx skills add tintaungkhant/let-ryan-code -g --skill '*' -a claude-code -a codex -a opencode -a antigravity -y` |
| Claude Code only | `npx skills add tintaungkhant/let-ryan-code -g --skill '*' -a claude-code -y` |
| Codex only | `npx skills add tintaungkhant/let-ryan-code -g --skill '*' -a codex -y` |
| OpenCode only | `npx skills add tintaungkhant/let-ryan-code -g --skill '*' -a opencode -y` |
| Antigravity only | `npx skills add tintaungkhant/let-ryan-code -g --skill '*' -a antigravity -y` |

Drop `-g` to install into the current project instead of globally. Then, in any project:

```
/ryan-wake-up
```

Ryan reads the project, asks about a dozen setup questions, and writes the agent files. See the [example output](examples/tiny-crm).

## Commands

| Command | What Ryan does |
|---|---|
| `ryan-wake-up` | Sets up the project's agent files (`AGENTS.md`, `CLAUDE.md`, `.ai/rules/`, `docs/`) by asking setup questions. |
| `ryan-rethink` | Changes the setup answers; asks only what you want to change and keeps your own edits. |
| `ryan-ship` | Sets up deploys: who deploys, `.ai/deployment.md`, `.ai/credentials.md`. Run it once the app is ready to ship. |
| `ryan-spec` | Asks a few questions (about 10 at most, each with a recommended answer), then writes a one-screen spec. |
| `ryan-tickets` | Splits the spec into a chain of tickets, each one committable on its own. |
| `ryan-plan` | Spec and tickets with one confirmation. Also starts on its own when you ask to plan. |
| `ryan-implement` | Implements a ticket: `ryan-implement 02`, `ryan-implement #12`, `ryan-implement all` for every open ticket in one run, or just `ryan-implement` for the next open one. Follows the project rules, runs the checks, ticks only what it verified. |
| `ryan-remember` | Parks an idea in the backlog, e.g. `ryan-remember CSV import for contacts`. |
| `ryan-status` | Shows where things stand: open tickets, which one is next, and the backlog. Starts nothing. |
| `ryan-talk` | Discusses an idea or a what-if. No spec, no tickets, no files. |

All commands except `ryan-plan` run only when you call them. Install every `ryan-*` skill together: the small commands run flows inside `ryan-wake-up` and `ryan-plan`.

## What you get

```
AGENTS.md              the single source: rules index, checks, planner, decisions, deploy
CLAUDE.md              @AGENTS.md (Claude Code reads AGENTS.md through it)
.ai/
  rules/
    autonomy.md        what Ryan may do without asking; always-on safety rules
    engineering.md     domain thinking, junior-readable code, packages, validation
    verification.md    honest reporting, tests, real side effects
    git.md             Conventional Commits, staging, secrets, worktrees
    docs.md            keeping docs true, decisions, generated files
  setup-answers.md     your answers, so a re-run asks only what changed
  deployment.md        after ryan-ship: environments, steps, rollback, costs
  credentials.md       after ryan-ship: gitignored, aliases and profiles over raw secrets
docs/README.md
.scratch/              tickets and backlog, if you keep them in local files
```

`AGENTS.md` stays short and is loaded every turn; each rule file is read only when a task touches its topic.

## Security

- `.env` files are read only if you allow it at setup. Otherwise Ryan works from `.env.example` and the code.
- Deploy credentials live in a gitignored file, are read only for deploy tasks, never printed, and never passed to subagents. Logged-in CLIs, SSH aliases and profiles are preferred, so a secret never enters the conversation.
- Tests never send real messages, emails or payments, and never touch a non-test database.
- Before committing, Ryan stops if a file holds a secret.

## Works with

| Tool | Status |
|---|---|
| Claude Code | Tested: scenarios 1 to 7 in [tests/scenarios.md](tests/scenarios.md) |
| Codex | Tested in the [benchmark](bench/results/2026-11-24-codex.md): setup, plan, `implement all` and plain prompts, 3 runs each |
| OpenCode | Built to the official skill docs; not yet tested |
| Antigravity | Built to the official skill docs; not yet tested |

The files `ryan-wake-up` writes work in all four: Codex, OpenCode and Antigravity read `AGENTS.md` directly, and Claude Code reads it through `CLAUDE.md`.

### Calling a command

| Tool | How |
|---|---|
| Claude Code | `/ryan-wake-up` |
| Codex | `$ryan-wake-up` |
| OpenCode | `@ryan-wake-up` |
| Antigravity | `/ryan-wake-up` |

### How each tool keeps commands user-only

| Tool | Mechanism |
|---|---|
| Claude Code, OpenCode | `disable-model-invocation: true` in `SKILL.md` |
| Codex | `agents/openai.yaml`: `policy.allow_implicit_invocation: false` |
| Antigravity | No setting exists; each description says "Run only when the user asks for … by name" |

## Other ways to install

**Update:** `npx skills update`.

**From a clone** (for contributors: your edits apply at once). Link each skill into every tool's global skills folder.

| Tool | Global skills folder |
|---|---|
| Claude Code | `~/.claude/skills/` |
| Codex | `~/.agents/skills/` |
| OpenCode | `~/.agents/skills/` (also reads `~/.claude/skills/`) |
| Antigravity | `~/.gemini/config/skills/` |

Windows (PowerShell, from the repo root; junctions need no admin rights):

```powershell
foreach ($dir in "$HOME\.claude\skills", "$HOME\.agents\skills", "$HOME\.gemini\config\skills") {
  New-Item -ItemType Directory -Force $dir | Out-Null
  foreach ($skill in Get-ChildItem -Directory -Filter "ryan-*" skills) {
    if (-not (Test-Path "$dir\$($skill.Name)")) { New-Item -ItemType Junction -Path "$dir\$($skill.Name)" -Target $skill.FullName | Out-Null }
  }
}
```

macOS / Linux (from the repo root):

```bash
for dir in ~/.claude/skills ~/.agents/skills ~/.gemini/config/skills; do
  mkdir -p "$dir"
  for skill in skills/ryan-*/; do
    name="$(basename "$skill")"
    [ -e "$dir/$name" ] || ln -s "$PWD/skills/$name" "$dir/$name"
  done
done
```

Restart the tool after installing. In Antigravity CLI, `/skills reload` also works.

## Repo layout

```
skills/ryan-*/     one folder per skill (SKILL.md, agents/openai.yaml, templates/)
examples/          real output on a sample app
tests/             validate.mjs and the test scenarios
bench/             benchmark: no skills vs let-ryan-code vs Matt Pocock's skills
docs/sources/      where each rule comes from (not shipped to agents)
```

## Contributing

1. Edit a skill under `skills/`.
2. Run `node tests/validate.mjs`. It checks that frontmatter parses, names match folders, each tool's user-only settings are in place, links between skills resolve, and every template placeholder has a fill rule. Add `--project <dir>` to also check a project that `ryan-wake-up` set up.
3. Run the affected scenarios in [tests/scenarios.md](tests/scenarios.md).
4. Add a new `ryan-*` skill to the command table above; the validator fails otherwise.
5. Add a line to [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)
