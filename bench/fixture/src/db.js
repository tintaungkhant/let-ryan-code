import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function openDb(path = process.env.CRM_DB ?? "data/crm.db") {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  return new DatabaseSync(path);
}
