---
name: ryan-implement
description: Implement a ticket by its number, the next open ticket when no number is given, or every open ticket with "all". Run only when the user asks for ryan-implement by name.
disable-model-invocation: true
---

# Ryan, implement it

Run the **implement** flow in `../ryan-plan/SKILL.md` (the `ryan-plan` folder beside this skill's folder). The ticket is the text the user wrote with this command, such as `02`, `#12`, `contact-tags/02` or `all`. With no text, take the next ticket.

If that file is missing, stop and tell the user: every `ryan-*` skill must be installed together (see the let-ryan-code README).
