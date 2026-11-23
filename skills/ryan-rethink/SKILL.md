---
name: ryan-rethink
description: Change this project's agent setup answers. Run only when the user asks for ryan-rethink by name.
disable-model-invocation: true
---

# Ryan, rethink

Run the setup in `../ryan-wake-up/SKILL.md` (the `ryan-wake-up` folder beside this skill's folder) in its **Re-run** mode. If the project has no `.ai/setup-answers.md`, it was never set up: run the full setup instead.

If that file is missing, stop and tell the user: every `ryan-*` skill must be installed together (see the let-ryan-code README).
