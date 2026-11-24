---
name: ryan-plan
description: Small planner for specs, tickets and backlog. Use when the user asks to plan a feature, write a spec, or break a feature into tickets; asks what is next or where things stand ("show tickets", "show the backlog"); asks to implement a ticket; or wants to park an idea for later ("note this", "do it later", "add to backlog"). A discussion or "what if" question is answered in chat; use this skill only once the user chooses to plan or park it.
---

# Ryan, let's plan

Flows: **spec**, **tickets**, **plan** (spec, then tickets), **implement**, **park**, **show status**. Pick the one the user's request matches.

Run a flow only when the user asks for it. "What's next?" is **show status**; start a ticket only when the user asks to implement it. A discussion or a "what if" question gets an answer in chat, not a spec or tickets. At the end of a discussion, ask once: park it, plan it, record a decision, or nothing.

## Store

`AGENTS.md` under "Planner" names where tickets and backlog live. If it names nothing, ask the user (local files / GitHub issues / another tool) and record the answer there.

**Local** (`.scratch/`):

- Spec: `.scratch/<feature-slug>/spec.md`, using the spec format below.
- Ticket: `.scratch/<feature-slug>/NN-<ticket-slug>.md`, using the ticket format below.
- Backlog: `.scratch/backlog.md`, one item per line: `- <title> — <one line of context> (<YYYY-MM-DD>)`.

**GitHub** (`gh`):

- Spec: `gh issue create --label spec --title "Spec: <feature>" --body "<spec body>"` (`gh label create spec` once, if missing).
- Ticket: `gh issue create --title "<title>" --body "<ticket body>"`. Put `Spec: #N` and `Blocked by: #N` in the body.
- Backlog: `gh issue create --label backlog ...` (`gh label create backlog` once, if missing). List it with `gh issue list --label backlog`.
- Done: tick the boxes with `gh issue edit`, then `gh issue close <N> --comment "<what was done, with the commit or PR>"`.

**Other tool**: use the create, list and close commands recorded in `AGENTS.md`.

## Spec format

```markdown
# <feature>

## Goal
<the problem it solves and for whom, two or three sentences>

## Decisions
- <each answer the user confirmed during the grill>

## Scope
- <what this feature includes>

## Out of scope
- <what it deliberately leaves out>

## Acceptance
- [ ] <checkable outcome for the whole feature>
```

Keep a spec to one screen. It says what and why; the tickets say in which steps.

## Ticket format

```markdown
# NN <title>

Status: open
Spec: <spec path or #N>
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
Spec: .scratch/contact-tags/spec.md
Blocked by: 01

## Goal
A user can add a tag to a contact and remove it from the contact page.

## Acceptance
- [ ] The contact page has an input that adds a tag and a remove button on each tag.
- [ ] Adding a duplicate tag (any letter case) shows a validation error from the server.
- [ ] A test covers add, remove and the duplicate error.
```

Bad: "Acceptance: tags work well and the UI looks nice." Nothing in it can be checked.

## Spec

1. **Grill.** Ask questions one at a time, each with your recommended answer. Example: "Should a tag be shared across contacts, or free text on each contact? I recommend shared, so the list can filter by it." Skip anything the code, the docs or `AGENTS.md` "Decisions" already answer: look first. Aim for at most 10 questions; ask more only when a real gap remains. If the feature needs something that does not exist yet (a table, a page, a service), ask whether to plan it first as the opening tickets or to stop; never plan on top of something assumed to exist. Done when you can write the spec without guessing.
2. **Write.** Write the spec in the spec format and show it to the user. Done when the user confirms it; if they ask for changes, make them and show it again.
3. **Save.** Save the spec in the store. Add its decisions to "Decisions" in `AGENTS.md`. Done when the spec is in the store.

## Tickets

1. **Read the spec.** Find the feature's spec in the store. If there is none, ask whether to write one first (**spec**) or to split straight from the user's description; for a small feature the description can be enough.
2. **Split.** Write the feature as a linear chain of tickets: each ticket blocked by the one before it, unless it is independent. Every spec acceptance box must be covered by some ticket. Show the list (titles, goals, blockers) to the user. Done when the user confirms the list; if they ask for changes, make them and show the list again.
3. **Save.** Create the confirmed tickets in the store, each pointing to the spec. Done when listing the store shows every confirmed ticket.

## Plan

Run **spec** and **tickets** with one confirmation instead of two. Grill as in **spec**. Then write the spec, split it into tickets, and show both together. When the user confirms, save the spec and the tickets, and add the decisions to "Decisions" in `AGENTS.md`. If they ask for changes, make them and show both again. Done when the spec and every ticket are in the store.

## Implement

1. Pick the ticket. If the user named one (`02`, `#12`, `contact-tags/02`), take it; if the name matches more than one ticket, ask which. If its blocker is not done yet, say so and ask before starting. If the user named none, take the lowest-numbered open ticket whose blocker is done. If the user wrote `all`, do every open ticket in order in this one run: steps 2 to 5 for each (read the rules once), then the next ticket whose blocker is done. Stop at the first ticket that stays open or needs the user's answer, and report which tickets are done. Work on one ticket at a time.
2. Before writing code, read the project's rules and follow them for the whole ticket: `.ai/rules/engineering.md` (how to build), `verification.md` (tests and honest checks), `git.md` (commits) and `autonomy.md` (what needs asking, and whether and how to use subagents). If the project has no `.ai/rules/`, follow `AGENTS.md`.
3. If the ticket's plan conflicts with a newer decision, rewrite the ticket's scope first. Do not leave the old plan in place.
4. When the work is done, run the commands under "Checks" in `AGENTS.md` and read their output. Then tick only the acceptance boxes you verified; a box that names a command counts as verified only when that command ran and passed. If a box cannot be ticked, the ticket stays open and you tell the user why.
5. Once every box is ticked, commit if `autonomy.md` allows it, asking first when it says to. Then mark the ticket done. Local: set `Status: done` and add `Done in: <commit or PR>`. GitHub: close it with a comment naming the commit or PR. If the commit cannot be made now (not approved, or git refuses), still mark the ticket done with `Done in: not committed yet`, and tell the user once; the next ticket may build on it. When the user later approves committing such tickets, make one commit per ticket, in ticket order, and update each `Done in:`; recommend this, never one commit for several tickets. If two tickets changed the same lines and cannot be split, say so and let the user choose. Done when the ticket is marked done.

Red flags: stop and correct course when you catch yourself thinking any of these.

| Thought | Instead |
|---|---|
| "This is small, I don't need the rules." | Read them anyway; they hold this project's style and limits. |
| "I'll do the next ticket in the same commit." | Finish and commit this ticket first. A ticket can take several commits; one commit never holds two tickets, unless the user commits them later by hand. |
| "The checks probably pass." | Run them and read the output. |
| "This box is close enough." | Leave it unticked and say what is missing. |
| "The plan is outdated, I'll just do what makes sense." | Rewrite the ticket's scope first, then do it. |

## Park

The user wants to note something for later while working on something else, or chose "park it" after a discussion. Do not grill. Save one backlog item: a title, one line of context (what work or discussion it came up in, and what the discussion concluded), and the date or label. Confirm in one line, then return to the current work. Done when the item is in the backlog.

To start a backlog item later, run **plan** on it and remove it from the backlog.

## Show status

Show where things stand, and start nothing.

1. Open tickets, grouped by feature, one line each: number, title, and what blocks it. Mark the next one (the lowest-numbered open ticket whose blocker is done) with `next:`. Flag done tickets whose `Done in:` says not committed yet.
2. Backlog items, one line each: title and context.

If the user asked only about tickets or only about the backlog, show only that part. Then stop; to start the next ticket, the user runs `ryan-implement`.
