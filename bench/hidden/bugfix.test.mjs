import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp, addContact } from "./_app.mjs";

test("bugfix: an email that differs only in letter case is rejected", async (t) => {
  const api = await startApp(t);
  await addContact(api, "aye@example.com");
  const again = await api("/api/contacts", { method: "POST", body: { name: "Aye 2", email: "AYE@Example.com" } });
  assert.equal(again.status, 409);
});

test("bugfix: different emails are still accepted", async (t) => {
  const api = await startApp(t);
  await addContact(api, "aye@example.com");
  const other = await api("/api/contacts", { method: "POST", body: { name: "Ben", email: "ben@example.com" } });
  assert.equal(other.status, 201);
});
