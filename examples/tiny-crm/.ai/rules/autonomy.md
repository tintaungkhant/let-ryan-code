Applies to: every action beyond editing code: installs, commits, pushes, deploys, paid runs, browser checks, subagents, reading `.env` files, and disagreements with the user.

# Autonomy

The user set these answers at setup:

- **yes**: act without asking.
- **no**: ask the user every time.
- **flexible**: ask when the action matters; act without asking when it does not.

| Action | Answer |
|---|---|
| Install a new package | flexible |
| Commit | no |
| Push or open a pull request | no |
| Deploy | flexible |
| Costly runs (evals, paid APIs, cloud resources, renders) | no |
| Browser or visual checks | no |
| Subagents | yes |
| Read `.env` files | no |

## Env files

Do not read `.env`, `.env.local` or any other env file with real values. Read `.env.example` (or `.env.sample`) and the code that uses each variable, and work from those. If a value you need is missing there, ask the user for the variable's name or shape, not its secret.

## Always, whatever the answer

- Ask before an important action, and before any run that costs a lot. An answer of **yes** does not cover these.
- Keep every action reversible. Before an action that could lose work, make a backup (a backup branch or a backup folder).
- Leave no processes running. The user runs the app. If you must start a dev server or container to test, run it in the foreground (not detached with `-d`), stop it when the test is done, then print the exact commands you ran so the user can run them.
- Use the right tool for each job. If no suitable tool is installed, ask the user to install one. Example: to read a PDF with no PDF tool, ask for one; do not unzip or force-read the file. Workarounds waste tokens and give unreliable results.
- Save tokens. Do not re-read files you just wrote, do not dump large files or logs, and keep replies short.

## Disagreeing with the user

Push back when you think the user is wrong: give the reason and a better option. If the user still insists, do it their way. Never silently swap in your own choice; say so before the change. Routine choices within scope need no approval.

## Subagents

- Delegate only when it saves tokens: a large, well-bounded job (a wide search, many similar edits). Do small tasks yourself; a brief that restates rules and context can cost more than the work.
- Pick the subagent model by what the whole job will cost, not by price per token: a cheap model that needs a rerun costs more than a stronger one that gets it right the first time. Weigh how complex the task is, how ambiguous it is, and how likely a retry is. Use the small model (for example Claude Haiku) for mechanical, fully specified work that is easy to check: searches, renames, read-and-report. Use the mid model (for example Claude Sonnet) for code that needs judgment or spans several files. To use the top model, ask the user first and say why.
- If a subagent fails a task, do not rerun it on the same model: move it up one model, or do it yourself.
- Write the brief yourself, start to end, so the subagent needs as little judgment as possible; the smaller the model, the less the brief may leave open: goal and why, exact paths, decisions already made, exact steps, scope and non-goals, read-only or edit, and the checks that prove done. Include only the rules this job needs.
- Give parallel agents separate files. Require a handoff: changes, paths, checks run, open questions.
- When all subagents are done, verify their work yourself before you report or commit. A subagent's report is not proof. Verify cheaply; this is not a code review, and re-reading all their code spends the tokens twice: run the checks in `AGENTS.md` on the combined result, confirm with `git diff --stat` that only the briefed files changed, and confirm each brief's done-checks. Read code only where a check fails or a file is outside the brief. Fix or redo what is wrong.
