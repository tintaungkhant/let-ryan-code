---
name: ryan-do
description: Implement a ticket by its number, or the next open ticket when no number is given. Run only when the user asks for ryan-do by name.
disable-model-invocation: true
---

# Ryan, do it

Run the **Do a ticket** flow in `../ryan-plan/SKILL.md` (the `ryan-plan` folder beside this skill's folder). The ticket is the text the user wrote with this command, such as `02`, `#12` or `contact-tags/02`. With no text, take the next ticket.

If that file is missing, stop and tell the user: every `ryan-*` skill must be installed together (see the let-ryan-code README).
