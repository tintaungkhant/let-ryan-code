# tiny-crm

A tiny Next.js CRM for managing contacts and deals.

## Rules

Rules live in `.ai/rules/`, one topic per file. Each file starts with an `Applies to:` line. At the start of every task, read every rule file whose topic touches the task. When unsure whether a file applies, read it.

- `autonomy.md`: what you may do without asking, safety rules that always apply, `.env` files, disagreeing with the user, subagents.
- `engineering.md`: domain thinking, resource use, how much to build, comments, packages, library docs, generators, server-side validation.
- `verification.md`: reporting checks honestly, tests, visual checks, real side effects.
- `git.md`: branches, secrets, staging, commits, commit messages, worktrees.
- `docs.md`: keeping docs true, recording decisions and generated files.

## Checks

These must pass before a commit:

- `npm run typecheck`
- `npm run lint`
- `npm test`

## Planner

Tickets and backlog live in: local files in .scratch/. Planner skills: `ryan-plan` (plan a feature), `ryan-do` (implement a ticket, or the next one), `ryan-remember` (park an idea), `ryan-backlog` (show the backlog), `ryan-talk` (discuss only).

Discussing is not planning. When the user explores an idea or asks "what if" (for example "what if we move from a VPS to k8s?"), answer and discuss only: no spec, ticket, plan or file. When the discussion ends, ask once in one line what to do with it: park it in the backlog, plan it now, record a settled decision in "Decisions", or nothing. "Nothing" is a normal answer.

## Decisions

Settled decisions. Do not reopen one unless the user does. When a decision changes, strike the old line through and add the date.

- Contacts are unique by email (2026-11-23).
- Tags are shared named records, many-to-many with contacts; names trimmed, 1 to 30 chars, unique case-insensitively (2026-11-23).
- A tag with no contacts is deleted automatically (2026-11-23).
- The contact list filters by one tag at a time, via `?tag=<name>` (2026-11-23).
- Contact tags assume a contacts table and list page already exist; this plan does not build them (2026-11-23).

### Out of scope

Features deliberately left out or removed. Do not add them back without asking.

- (none yet)

## Generated files

Do not hand-edit these; a regenerate overwrites hand edits. Regenerate with the listed command.

- (none yet)

## Deploy

Before any deploy, server or cloud task, read `.ai/deployment.md` and `.ai/credentials.md`. Read `credentials.md` for no other task.

## Docs

`docs/` describes how the project works now. See `.ai/rules/docs.md`.
