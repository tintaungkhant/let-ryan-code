# 01 Tag data model and server actions

Status: open
Blocked by: none

## Goal
Tags exist as shared named records linked many-to-many to contacts. Server actions add a tag to a contact and remove one from it.

## Acceptance
- [x] Tag names are trimmed, 1 to 30 characters, unique case-insensitively; the server rejects anything else.
- [x] Adding a name that already exists reuses that tag; it never creates a duplicate.
- [x] Removing a tag from a contact deletes the tag when no contact uses it any more.
- [x] Tests cover add, reuse, invalid name and remove with orphan cleanup.
- [ ] `npm run typecheck`, `npm run lint` and `npm test` pass.
