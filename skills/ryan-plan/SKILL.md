---
name: ryan-plan
description: Small planner for tickets and backlog. Use when the user asks to plan or break down a feature into tickets, asks what to work on next or to pick up a ticket, or wants to park an idea for later ("note this", "do it later", "add to backlog", "show the backlog"). A discussion or "what if" question is answered in chat; use this skill only once the user chooses to plan or park it.
---

# Ryan, let's plan

Four flows: **plan**, **do a ticket**, **park**, **show backlog**. Pick the one the user's request matches.

Run a flow only when the user asks for it. A discussion or a "what if" question gets an answer in chat, not a spec or tickets. At the end of a discussion, ask once: park it, plan it, record a decision, or nothing.

## Store

`AGENTS.md` under "Planner" names where tickets and backlog live. If it names nothing, ask the user (local files / GitHub issues / another tool) and record the answer there.

**Local** (`.scratch/`):

- Ticket: `.scratch/<feature-slug>/NN-<ticket-slug>.md`, using the ticket format below.
- Backlog: `.scratch/backlog.md`, one item per line: `- <title> — <one line of context> (<YYYY-MM-DD>)`.

**GitHub** (`gh`):

- Ticket: `gh issue create --title "<title>" --body "<ticket body>"`. Put `Blocked by: #N` in the body.
- Backlog: `gh issue create --label backlog ...` (`gh label create backlog` once, if missing). List it with `gh issue list --label backlog`.
- Done: tick the boxes with `gh issue edit`, then `gh issue close <N> --comment "<what was done, with the commit or PR>"`.

**Other tool**: use the create, list and close commands recorded in `AGENTS.md`.

## Ticket format

```markdown
# NN <title>

Status: open
Blocked by: <NN or none>

## Goal
<what is true when this is done, one or two sentences>

## Acceptance
- [ ] <checkable outcome>
```

A ticket is one coherent step that can be committed on its own and passes the project's checks. Each acceptance box is something you can check by running or reading, not a feeling.

Good:

```markdown
# 02 Add and remove tags on a contact

Status: open
Blocked by: 01

## Goal
A user can add a tag to a contact and remove it from the contact page.

## Acceptance
- [ ] The contact page has an input that adds a tag and a remove button on each tag.
- [ ] Adding a duplicate tag (any letter case) shows a validation error from the server.
- [ ] A test covers add, remove and the duplicate error.
```

Bad: "Acceptance: tags work well and the UI looks nice." Nothing in it can be checked.

## Plan

1. **Grill.** Ask questions one at a time, each with your recommended answer. Example: "Should a tag be shared across contacts, or free text on each contact? I recommend shared, so the list can filter by it." Skip anything the code, the docs or `AGENTS.md` "Decisions" already answer: look first. Aim for at most 10 questions; ask more only when a real gap remains. If the feature needs something that does not exist yet (a table, a page, a service), ask whether to plan it first as the opening tickets or to stop; never plan on top of something assumed to exist. Done when you can write every ticket's goal and acceptance boxes without guessing.
2. **Split.** Write the feature as a linear chain of tickets: each ticket blocked by the one before it, unless it is independent. Show the list (titles, goals, blockers) to the user. Done when the user confirms the list; if they ask for changes, make them and show the list again.
3. **Save.** Create the confirmed tickets in the store. Add the answers the user confirmed during the grill to "Decisions" in `AGENTS.md`. Done when listing the store shows every confirmed ticket.

## Do a ticket

1. Pick the ticket. If the user named one (`02`, `#12`, `contact-tags/02`), take it; if the name matches more than one ticket, ask which. If its blocker is still open, say so and ask before starting. If the user named none, take the lowest-numbered open ticket whose blocker is closed. Work on one ticket at a time.
2. Before writing code, read the project's rules and follow them for the whole ticket: `.ai/rules/engineering.md` (how to build), `verification.md` (tests and honest checks), `git.md` (commits) and `autonomy.md` (what needs asking, and whether and how to use subagents). If the project has no `.ai/rules/`, follow `AGENTS.md`.
3. If the ticket's plan conflicts with a newer decision, rewrite the ticket's scope first. Do not leave the old plan in place.
4. When the work is done, run the commands under "Checks" in `AGENTS.md` and read their output. Then tick only the acceptance boxes you verified; a box that names a command counts as verified only when that command ran and passed. Then mark the ticket done, and point to the commit or PR. If committing needs the user's OK (`autonomy.md`), ask for it first; the ticket is done once the commit exists. Local: set `Status: done` and add a `Done in: <commit or PR>` line. GitHub: close it with a comment. Done when the ticket is marked done and every box is ticked; if a box cannot be ticked, the ticket stays open and you tell the user why.

Red flags: stop and correct course when you catch yourself thinking any of these.

| Thought | Instead |
|---|---|
| "This is small, I don't need the rules." | Read them anyway; they hold this project's style and limits. |
| "I'll do the next ticket in the same commit." | One ticket, one commit. Finish this one first. |
| "The checks probably pass." | Run them and read the output. |
| "This box is close enough." | Leave it unticked and say what is missing. |
| "The plan is outdated, I'll just do what makes sense." | Rewrite the ticket's scope first, then do it. |

## Park

The user wants to note something for later while working on something else, or chose "park it" after a discussion. Do not grill. Save one backlog item: a title, one line of context (what work or discussion it came up in, and what the discussion concluded), and the date or label. Confirm in one line, then return to the current work. Done when the item is in the backlog.

To start a backlog item later, run **Plan** on it and remove it from the backlog.

## Show backlog

List the backlog items, one line each: title and context. Nothing else.
