# tiny-crm

A small contacts API. Node 24+, no dependencies (uses `node:sqlite` and `node:test`).

```
npm run migrate   # create or update data/crm.db
npm run seed      # add sample contacts
npm start         # http://localhost:3000
npm test
```

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/contacts` | list |
| POST | `/api/contacts` | `{ name, email, phone? }`; 400 on invalid input, 409 on a duplicate email |
| GET | `/api/contacts/:id` | 404 if missing |
| DELETE | `/api/contacts/:id` | 204, or 404 if missing |
| GET | `/api/contacts.csv` | CSV export |

The mobile app (v1) reads `/api/contacts` and `/api/contacts/:id`, and the sales team imports `/api/contacts.csv` into a spreadsheet. Field names and CSV columns are a public contract: `id`, `name`, `email`, `phone`, `created_at`.

## Database

SQLite at `data/crm.db` (`CRM_DB` overrides the path). Migrations live in `migrations/` and run in name order; applied ones are recorded in `schema_migrations`.
