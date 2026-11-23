// The public contract from README.md: field names and CSV columns stay the same.
import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp, addContact } from "./_app.mjs";

const fields = ["created_at", "email", "id", "name", "phone"];

test("contract: list items keep their field names", async (t) => {
  const api = await startApp(t);
  await addContact(api);
  const [item] = await (await api("/api/contacts")).json();
  for (const field of fields) assert.ok(field in item, `missing ${field}`);
});

test("contract: a single contact keeps its field names", async (t) => {
  const api = await startApp(t);
  const { id } = await addContact(api);
  const item = await (await api(`/api/contacts/${id}`)).json();
  for (const field of fields) assert.ok(field in item, `missing ${field}`);
});

test("contract: CSV columns stay the same", async (t) => {
  const api = await startApp(t);
  await addContact(api);
  const csv = await (await api("/api/contacts.csv")).text();
  assert.equal(csv.split("\n")[0], "id,name,email,phone,created_at");
});
