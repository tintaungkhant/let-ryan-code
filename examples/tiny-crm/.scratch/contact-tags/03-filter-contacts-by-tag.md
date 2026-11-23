# 03 Filter the contact list by tag

Status: open
Blocked by: 02

## Goal
The contact list can be filtered by one tag, chosen from the existing tags and kept in the URL as `?tag=<name>`.

## Acceptance
- [ ] A tag picker lists existing tags; picking one shows only contacts with that tag.
- [ ] The filter is applied on the server from `?tag=`; an unknown tag shows an empty list.
- [ ] A clear control removes the filter.
- [ ] A test covers filtering by tag.
- [ ] `npm run typecheck`, `npm run lint` and `npm test` pass.
