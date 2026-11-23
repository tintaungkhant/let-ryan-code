// Starts the workspace app on an in-memory database. Copied into <workspace>/test-hidden/ at scoring time.
import { openDb } from "../src/db.js";
import { migrate } from "../src/migrate.js";
import { createApp } from "../src/server.js";

export async function startApp(t) {
  const db = openDb(":memory:");
  migrate(db);
  const server = createApp(db).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => server.close());
  const base = `http://localhost:${server.address().port}`;
  return (path, { method = "GET", body } = {}) =>
    fetch(base + path, {
      method,
      headers: { "content-type": "application/json" },
      body: body && JSON.stringify(body),
    });
}

export async function addContact(api, email = "aye@example.com") {
  const response = await api("/api/contacts", { method: "POST", body: { name: "Aye", email, phone: "+95 1" } });
  return response.json();
}
