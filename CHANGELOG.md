# Changelog

## Unreleased

- `ryan-wake-up` rules: approval to run destructive migrations or change real data (writing them stays ordinary); keep public contracts and ask before breaking ones; report unrelated problems instead of fixing them; `git status` first and never touch others' uncommitted changes.
- Subagents: model picked by complexity, ambiguity and expected retries; move up a model after a failure; targeted read of security, money, concurrency and data-integrity changes.
- `ryan-plan`: a ticket can take several commits; one commit never holds two tickets. A verified ticket is done even when it cannot be committed yet, so the next ticket is not blocked; once approved, such tickets get one commit each.
- `ryan-plan`: one confirmation for spec and tickets together; `ryan-implement all` builds every open ticket in one run.
- `bench/`: no skills vs let-ryan-code vs Matt Pocock's skills, in Claude Code or Codex; Codex and Claude Code results (3 runs each) in `bench/results/`, reported in tokens with subagents included.

## 0.1.0 (2026-11-23)

- `ryan-wake-up`: project agent-file setup (`AGENTS.md`, `CLAUDE.md`, `.ai/rules/`, `docs/`) from setup questions; re-run and deploy-only modes.
- `ryan-plan`: tickets and backlog in local files, GitHub issues or another tool.
- Commands: `ryan-rethink`, `ryan-ship`, `ryan-spec`, `ryan-tickets`, `ryan-implement`, `ryan-remember`, `ryan-status`, `ryan-talk`.
- Works in Claude Code (tested), Codex, OpenCode and Antigravity (built to their docs).
- `tests/validate.mjs` and 7 test scenarios; CI runs the validator.
- `examples/tiny-crm`: real output on a sample app.
