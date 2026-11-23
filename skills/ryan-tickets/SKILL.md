---
name: ryan-tickets
description: Break a feature's spec into a chain of tickets. Run only when the user asks for ryan-tickets by name.
disable-model-invocation: true
---

# Ryan, make the tickets

Run the **tickets** flow in `../ryan-plan/SKILL.md` (the `ryan-plan` folder beside this skill's folder). The feature is the text the user wrote with this command; if there is none and more than one spec has no tickets yet, ask which.

If that file is missing, stop and tell the user: every `ryan-*` skill must be installed together (see the let-ryan-code README).
