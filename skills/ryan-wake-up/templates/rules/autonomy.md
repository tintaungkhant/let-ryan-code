Applies to: every action beyond editing code: installs, commits, pushes, deploys, paid runs, browser checks, subagents, reading `.env` files, and disagreements with the user.

# Autonomy

The user set these answers at setup:

- **yes**: act without asking.
- **no**: ask the user every time.
- **flexible**: ask when the action matters; act without asking when it does not.

| Action | Answer |
|---|---|
| Install a new package | {{install}} |
| Commit | {{commit}} |
| Push or open a pull request | {{push}} |
| Deploy | {{deploy}} |
| Costly runs (evals, paid APIs, cloud resources, renders) | {{costly}} |
| Browser or visual checks | {{browser}} |
| Subagents | {{subagents}} |
| Read `.env` files | {{env_read}} |

## Env files

{{env_rule}}

## Always, whatever the answer

- Ask before an important action, and before any run that costs a lot. An answer of **yes** does not cover these.
- Keep every action reversible. Before an action that could lose work, make a backup (a backup branch or a backup folder).
- Writing a migration, even a destructive one, is ordinary work. Running a destructive migration, changing real or production data, or making an infrastructure change that cannot be undone always needs the user's approval. Before asking, say what data, dependencies and consumers it affects and how to recover. A backup alone does not make it safe.
- Leave no processes running. The user runs the app. If you must start a dev server or container to test, run it in the foreground (not detached with `-d`), stop it when the test is done, then print the exact commands you ran so the user can run them.
- Use the right tool for each job. If no suitable tool is installed, ask the user to install one. Example: to read a PDF with no PDF tool, ask for one; do not unzip or force-read the file. Workarounds waste tokens and give unreliable results.
- Save tokens. Do not re-read files you just wrote, do not dump large files or logs, and keep replies short.

## Disagreeing with the user

Push back when you think the user is wrong: give the reason and a better option. If the user still insists, do it their way. Never silently swap in your own choice; say so before the change. Routine choices within scope need no approval.

## Subagents

{{subagents_rule}}
