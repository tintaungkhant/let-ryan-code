# let-ryan-code

Two skills that work in Claude Code, Codex, OpenCode and Antigravity:

- `agent-setup`: sets up a project's agent files (`AGENTS.md`, `CLAUDE.md`, `.ai/rules/`, `docs/`) by asking setup questions. Runs only when you ask for it.
- `planner`: small planner for tickets and backlog.

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
  foreach ($skill in "agent-setup", "planner") {
    if (-not (Test-Path "$dir\$skill")) { New-Item -ItemType Junction -Path "$dir\$skill" -Target "$PWD\$skill" | Out-Null }
  }
}
```

macOS / Linux (from this folder):

```bash
for dir in ~/.claude/skills ~/.agents/skills ~/.gemini/config/skills; do
  mkdir -p "$dir"
  for skill in agent-setup planner; do
    [ -e "$dir/$skill" ] || ln -s "$PWD/$skill" "$dir/$skill"
  done
done
```

Restart the tool after installing. In Antigravity CLI, `/skills reload` also works.

OpenCode reads both `~/.agents/skills/` and `~/.claude/skills/`, so it may list each skill twice. Same files, so it is harmless.

## Update

`git pull` in this repo. The links pick up the change; restart the tool.

## Use

| Tool | Run agent-setup | Deploy only |
|---|---|---|
| Claude Code | `/agent-setup` | `/agent-setup deploy` |
| Codex | `$agent-setup` | `$agent-setup set up deploy` |
| OpenCode | `@agent-setup` | `@agent-setup set up deploy` |
| Antigravity | `/agent-setup` | `/agent-setup set up deploy` |

The planner starts on its own when you ask to plan a feature, pick the next ticket, park an idea, or show the backlog.

## How each tool keeps agent-setup user-only

| Tool | Mechanism |
|---|---|
| Claude Code, OpenCode | `disable-model-invocation: true` in `SKILL.md` |
| Codex | `agents/openai.yaml`: `policy.allow_implicit_invocation: false` |
| Antigravity | no setting exists; the description says "Run only when the user asks for agent-setup by name" |

## Project files

The files agent-setup writes work in all four tools: Codex, OpenCode and Antigravity read `AGENTS.md` directly; Claude Code reads `CLAUDE.md`, which imports it (`@AGENTS.md`).
