---
name: ryan-spec
description: Write a short spec for a feature after a few questions. Run only when the user asks for ryan-spec by name.
disable-model-invocation: true
---

# Ryan, write the spec

Run the **spec** flow in `../ryan-plan/SKILL.md` (the `ryan-plan` folder beside this skill's folder). The feature is the text the user wrote with this command; if there is none, ask for it in one line.

If that file is missing, stop and tell the user: every `ryan-*` skill must be installed together (see the let-ryan-code README).
