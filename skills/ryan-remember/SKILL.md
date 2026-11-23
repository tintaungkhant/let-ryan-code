---
name: ryan-remember
description: Park an idea in the backlog for later. Run only when the user asks for ryan-remember by name.
disable-model-invocation: true
---

# Ryan, remember this

Run the **Park** flow in `../ryan-plan/SKILL.md` (the `ryan-plan` folder beside this skill's folder). The idea is the text the user wrote with this command; if there is none, ask for it in one line.

If that file is missing, stop and tell the user: every `ryan-*` skill must be installed together (see the let-ryan-code README).
