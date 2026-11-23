import { test } from "node:test";
import assert from "node:assert/strict";
import { openDb } from "../src/db.js";
import { migrate } from "../src/migrate.js";
import { createApp } from "../src/server.js";

async function startApp() {
  const db = openDb(":memory:");
  migrate(db);
  const server = createApp(db).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://localhost:${server.address().port}`;
  const api = (path, options = {}) =>
    fetch(base + path, {
      ...options,
      headers: { "content-type": "application/json" },
      body: options.body && JSON.stringify(options.body),
    });
  return { api, close: () => server.close() };
}

test("creates and lists contacts", async (t) => {
  const { api, close } = await startApp();
  t.after(close);
  const created = await api("/api/contacts", { method: "POST", body: { name: "Aye", email: "aye@example.com" } });
  assert.equal(created.status, 201);
  const list = await (await api("/api/contacts")).json();
  assert.deepEqual(Object.keys(list[0]).sort(), ["created_at", "email", "id", "name", "phone"]);
});

test("rejects a contact without a name", async (t) => {
  const { api, close } = await startApp();
  t.after(close);
  const response = await api("/api/contacts", { method: "POST", body: { email: "x@example.com" } });
  assert.equal(response.status, 400);
});

test("rejects the same email twice", async (t) => {
  const { api, close } = await startApp();
  t.after(close);
  await api("/api/contacts", { method: "POST", body: { name: "Aye", email: "aye@example.com" } });
  const again = await api("/api/contacts", { method: "POST", body: { name: "Aye 2", email: "aye@example.com" } });
  assert.equal(again.status, 409);
});

test("returns 404 for a missing contact", async (t) => {
  const { api, close } = await startApp();
  t.after(close);
  assert.equal((await api("/api/contacts/999")).status, 404);
});

test("exports CSV with the contract columns", async (t) => {
  const { api, close } = await startApp();
  t.after(close);
  const csv = await (await api("/api/contacts.csv")).text();
  assert.equal(csv.split("\n")[0], "id,name,email,phone,created_at");
});
