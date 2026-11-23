# let-ryan-code

Talk to Ryan, your coding agent. Works in Claude Code, Codex, OpenCode and Antigravity.

| Command | What Ryan does |
|---|---|
| `ryan-wake-up` | Sets up the project's agent files (`AGENTS.md`, `CLAUDE.md`, `.ai/rules/`, `docs/`) by asking setup questions. |
| `ryan-rethink` | Changes the setup answers; asks only what you want to change. |
| `ryan-ship` | Sets up deploys: who deploys, `.ai/deployment.md`, `.ai/credentials.md`. Run it once the app is ready to ship. |
| `ryan-plan` | Plans a feature: a few questions, then a chain of tickets. Also starts on its own when you ask to plan. |
| `ryan-next` | Picks up the next open ticket. |
| `ryan-remember` | Parks an idea in the backlog, e.g. `ryan-remember CSV import for contacts`. |
| `ryan-backlog` | Shows the backlog. |
| `ryan-talk` | Discusses an idea or a what-if. No spec, no tickets, no files. |

All commands except `ryan-plan` run only when you call them.

## Install

Link each skill folder into every tool's global skills folder. A link (not a copy) means a `git pull` here updates every tool at once.

| Tool | Global skills folder |
|---|---|
| Claude Code | `~/.claude/skills/` |
| Codex, OpenCode | `~/.agents/skills/` |
| Antigravity | `~/.gemini/config/skills/` |

Windows (PowerShell, from this folder; junctions need no admin rights):

```powershell
foreach ($dir in "$HOME\.claude\skills", "$HOME\.agents\skills", "$HOME\.gemini\config\skills") {
  New-Item -ItemType Directory -Force $dir | Out-Null
  foreach ($skill in Get-ChildItem -Directory -Filter "ryan-*") {
    if (-not (Test-Path "$dir\$($skill.Name)")) { New-Item -ItemType Junction -Path "$dir\$($skill.Name)" -Target $skill.FullName | Out-Null }
  }
}
```

macOS / Linux (from this folder):

```bash
for dir in ~/.claude/skills ~/.agents/skills ~/.gemini/config/skills; do
  mkdir -p "$dir"
  for skill in ryan-*/; do
    skill="${skill%/}"
    [ -e "$dir/$skill" ] || ln -s "$PWD/$skill" "$dir/$skill"
  done
done
```

Restart the tool after installing. In Antigravity CLI, `/skills reload` also works.

OpenCode reads both `~/.agents/skills/` and `~/.claude/skills/`, so it may list each skill twice. Same files, so it is harmless.

## Update

`git pull` in this repo, then restart the tool. When a pull adds a new `ryan-*` folder, run the install block again to link it.

## Calling a command

| Tool | How |
|---|---|
| Claude Code | `/ryan-wake-up` |
| Codex | `$ryan-wake-up` |
| OpenCode | `@ryan-wake-up` |
| Antigravity | `/ryan-wake-up` |

## How each tool keeps commands user-only

| Tool | Mechanism |
|---|---|
| Claude Code, OpenCode | `disable-model-invocation: true` in `SKILL.md` |
| Codex | `agents/openai.yaml`: `policy.allow_implicit_invocation: false` |
| Antigravity | no setting exists; each description says "Run only when the user asks for … by name" |

## Project files

The files `ryan-wake-up` writes work in all four tools: Codex, OpenCode and Antigravity read `AGENTS.md` directly; Claude Code reads `CLAUDE.md`, which imports it (`@AGENTS.md`).
