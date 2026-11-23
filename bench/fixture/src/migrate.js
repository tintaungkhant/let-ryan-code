import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { openDb } from "./db.js";

const dir = fileURLToPath(new URL("../migrations/", import.meta.url));

export function migrate(db) {
  db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY)");
  const done = new Set(db.prepare("SELECT name FROM schema_migrations").all().map((row) => row.name));
  for (const name of readdirSync(dir).filter((file) => file.endsWith(".sql")).sort()) {
    if (done.has(name)) continue;
    db.exec(readFileSync(join(dir, name), "utf8"));
    db.prepare("INSERT INTO schema_migrations (name) VALUES (?)").run(name);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) migrate(openDb());
