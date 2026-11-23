---
name: ryan-wake-up
description: Set up a project's agent files (AGENTS.md, CLAUDE.md, .ai/rules/, docs/) by asking the user setup questions. Run only when the user asks for ryan-wake-up by name.
disable-model-invocation: true
---

# Ryan, wake up

Writes one set of agent instructions that Claude and Codex both read: `AGENTS.md` is the single source, `CLAUDE.md` only imports it, and the rules live in `.ai/rules/`. The user's answers to the setup questions decide the preference rules.

Templates are in the `templates/` folder beside this SKILL.md. Replace every `{{placeholder}}`; no `{{` may remain in the written files.

## 1. Inspect the project

Read, without changing anything. Do not open `.env` files with real values; `env_read` is not answered yet. `.env.example` is fine.

- existing agent files: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.ai/`, `.agents/`, `.claude/`, `.codex/`, `.opencode/`, `opencode.json`
- `.ai/setup-answers.md`: answers from an earlier run of this setup, if any
- package manifests and their scripts (`package.json`, `composer.json`, `pyproject.toml`, ...), and CI config
- folders of generated code (for example `resources/js/actions/`, `schema.ts`, Prisma or OpenAPI clients)
- deploy config: `vercel.json`, `wrangler.toml`, `Dockerfile`, compose files, CI deploy jobs, existing deployment docs. If a credentials file exists, note its path but do not read its values.

Done when you can name: the project in one line, the check commands (typecheck, lint, test) as the scripts define them, run with the package manager the lockfile shows (npm, pnpm, yarn, bun; with no lockfile, confirm in step 2), any generated files with their regenerate command, and which agent files already exist.

## 2. Ask the setup questions

Use the tool's structured question tool if it has one (Claude Code `AskUserQuestion`, up to 4 per call; OpenCode `question`; Antigravity `ask_question`); otherwise ask in chat, a few at a time. Ask in the user's language. Put the default first.

**Re-run** (also what `ryan-rethink` starts): if `.ai/setup-answers.md` exists, show the saved answers and ask which ones to change. Ask in full only the changed ones and any question missing from the file. Then change only what a changed answer or a newer template affects: back up and rewrite only those files, leave the rest untouched, and set `date:` to today.

**Deploy only:** when started from `ryan-ship`, or when the user asks for deploy setup only (most new apps set up deploys later), ask only `deploy_owner`, `deploy` and `commit_deployment`. Then run steps 3 to 5 for the deploy files only: the "Deploy" section of `AGENTS.md`, the `deploy` row in `autonomy.md`, `.ai/deployment.md`, `.ai/credentials.md`, `.gitignore`, and `.ai/setup-answers.md`.

**yes / no / flexible** (yes = act without asking; no = always ask; flexible = ask only when it matters):

| id | Question |
|---|---|
| `install` | Install new packages without asking? |
| `commit` | Commit without asking? |
| `push` | Push and open pull requests without asking? |
| `deploy` | Deploy without asking? Ask only when `deploy_owner` is "we deploy"; otherwise the answer is `no`. |
| `costly` | Run costly things (evals, paid APIs, cloud resources, renders) without asking? |

**yes / no only:**

| id | Question | Default |
|---|---|---|
| `browser` | Allow browser or visual checks? | no |
| `subagents` | Allow subagents? | — |
| `env_read` | Allow reading `.env` files? | — |

**choices:**

| id | Question | Options |
|---|---|---|
| `test_style` | How does this project test? | TDD / tests, not test-first / no tests, typecheck is the gate |
| `commit_body` | Commit messages are always a short Conventional Commits title (`feat(auth): add password reset`). Add a body too? | title only / title and body |
| `attribution` | Add an AI co-author line (`Co-Authored-By`) to commits and PRs? | yes / no |
| `deploy_owner` | Who deploys this project? Ask before `deploy`. | not set up yet, set up later with `ryan-ship` / we deploy / devops deploys |
| `commit_deployment` | Commit `.ai/deployment.md` to git? Ask only when "we deploy". Commit it only if it holds no secrets. | no, gitignore it / yes |
| `planner_store` | Where do tickets and backlog live? | local files in `.scratch/` / GitHub issues (`gh`) / other (ask which CLI or MCP tool, and the commands to create, list and close an item) |
| `commit_scratch` | Commit the local tickets and backlog in `.scratch/` to git? Ask only when `planner_store` is local files. | yes / no, gitignore it |

Done when every question has an answer. Also confirm the one-line description and the check commands you found.

## 3. Back up and merge

If any target file already exists, copy it to `.ai/backup-<YYYY-MM-DD-HHMM>/` first, so the setup can be undone. Appending lines to `.gitignore` needs no backup.

When merging into an existing file, keep:

- project-specific content (commands, architecture, gotchas). Move rules that fit a `.ai/rules/` topic into that file.
- in rule files from an earlier setup, every line that is not in the template: the user added or changed it. Drop only lines that a changed answer replaces.
- blocks managed by a tool between marker comments (for example `<!-- BEGIN:nextjs-agent-rules -->`), unchanged. The tool rewrites them.

## 4. Write the files

| Written file | From |
|---|---|
| `AGENTS.md` | `templates/AGENTS.md` |
| `CLAUDE.md` | `templates/CLAUDE.md` |
| `.ai/rules/autonomy.md`, `engineering.md`, `verification.md`, `git.md`, `docs.md` | `templates/rules/` |
| `docs/README.md` | one line: "Docs describing how the project works now. Keep them true: see `.ai/rules/docs.md`." |
| `.gitignore` | add a `.worktree/` line if missing. Add `.scratch/` if `commit_scratch` is no. When "we deploy": add `.ai/credentials.md`, and `.ai/deployment.md` if `commit_deployment` is no |
| `.ai/deployment.md`, `.ai/credentials.md` | `templates/deploy/`, only when "we deploy". Fill what step 1 found (environments, deploy and rollback commands); leave the rest as "(not set yet)". If the project already has deployment or credentials files elsewhere, ask the user whether to move them here. |
| `.ai/setup-answers.md` | `date: <YYYY-MM-DD>`, then one `<id>: <answer>` line per question, including answers set by a rule instead of asked (`deploy: no`). Leave out questions that were skipped. |

Fill the placeholders:

- `{{install}}`, `{{commit}}`, `{{push}}`, `{{deploy}}`, `{{costly}}`, `{{browser}}`, `{{subagents}}`, `{{env_read}}`: the answer word (`yes`, `no`, `flexible`).
- `{{subagents_rule}}`:
  - yes, write these bullets:
    - "Delegate only when it saves tokens: a large, well-bounded job (a wide search, many similar edits). Do small tasks yourself; a brief that restates rules and context can cost more than the work."
    - "Subagents use the cheapest model that can do the job (for example Claude Haiku, or the tool's small model). To use a more expensive model, ask the user first and say why."
    - "A cheap model follows instructions well but reasons weakly. Write the brief yourself, start to end, so it needs no judgment: goal and why, exact paths, decisions already made, exact steps, scope and non-goals, read-only or edit, and the checks that prove done. Include only the rules this job needs."
    - "Give parallel agents separate files. Require a handoff: changes, paths, checks run, open questions."
    - "When all subagents are done, verify their work yourself before you report or commit. A subagent's report is not proof. Verify cheaply; this is not a code review, and re-reading all their code spends the tokens twice: run the checks in `AGENTS.md` on the combined result, confirm with `git diff --stat` that only the briefed files changed, and confirm each brief's done-checks. Read code only where a check fails or a file is outside the brief. Fix or redo what is wrong."
  - no: "Do all work yourself. Run steps that a skill would delegate to subagents inline instead."
- `{{test_style_rule}}`:
  - TDD: "Write the smallest test for the change first and see it fail for the intended reason, then make it pass. For a bug, reproduce it with a test first. If that is not feasible, say so instead of claiming a failing step occurred."
  - tests, not test-first: "Add or update a test for every behavior change."
  - typecheck is the gate: "There is no test runner. The typecheck command is the correctness gate; treat its errors as authoritative."
- `{{env_rule}}`:
  - yes: "You may read `.env` files. Never print their secret values in replies, logs, commits or docs."
  - no: "Do not read `.env`, `.env.local` or any other env file with real values. Read `.env.example` (or `.env.sample`) and the code that uses each variable, and work from those. If a value you need is missing there, ask the user for the variable's name or shape, not its secret."
- `{{commit_body_rule}}`:
  - title only: "Write the title only, no body."
  - title and body: "After a blank line, add a short body: why the change was made, and anything a reviewer must know. Wrap at 72 characters."
- `{{attribution_rule}}`:
  - yes: "Add the AI co-author line to commits and pull requests."
  - no: "Add no AI attribution: no `Co-Authored-By` line and no 'Generated with' line."
- `{{deploy_section}}`:
  - not set up yet: "No deploy plan yet. Do not deploy or change servers or cloud resources. When the user is ready, they run `ryan-ship`."
  - we deploy: "Before any deploy, server or cloud task, read `.ai/deployment.md` and `.ai/credentials.md`. Read `credentials.md` for no other task."
  - devops deploys: "Devops does the deploys. Do not deploy or change servers or cloud resources. Prepare the change, then tell the user what devops needs: migrations, new env variables, config changes."
- `{{project_name}}`: the package manifest's `name`, else the folder name.
- `{{one_line_description}}`: from step 1.
- `{{check_commands}}`: one bullet per command, as a code span.
- `{{planner_store}}`: `local files in .scratch/`, `GitHub issues (gh)`, or the named tool with its create, list and close commands.

Done when every file is written and a search for `{{` in them finds nothing.

## 5. Report

Tell the user: the files written, the answer to each question, and the backup folder if one was made.
