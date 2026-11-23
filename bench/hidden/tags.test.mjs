// The tags API exactly as the task prompt describes it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp, addContact } from "./_app.mjs";

const addTag = (api, id, tag) => api(`/api/contacts/${id}/tags`, { method: "POST", body: { tag } });
const tagsOf = async (api, id) => (await (await api(`/api/contacts/${id}`)).json()).tags;

test("tags: add a tag and see it on the contact", async (t) => {
  const api = await startApp(t);
  const { id } = await addContact(api);
  const response = await addTag(api, id, "vip");
  assert.ok(response.status >= 200 && response.status < 300, `status ${response.status}`);
  assert.deepEqual(await tagsOf(api, id), ["vip"]);
});

test("tags: the same tag in another letter case is rejected with 409", async (t) => {
  const api = await startApp(t);
  const { id } = await addContact(api);
  await addTag(api, id, "vip");
  assert.equal((await addTag(api, id, "VIP")).status, 409);
});

test("tags: remove a tag", async (t) => {
  const api = await startApp(t);
  const { id } = await addContact(api);
  await addTag(api, id, "vip");
  const response = await api(`/api/contacts/${id}/tags/vip`, { method: "DELETE" });
  assert.ok(response.status >= 200 && response.status < 300, `status ${response.status}`);
  assert.deepEqual(await tagsOf(api, id), []);
});

test("tags: filter the list by tag", async (t) => {
  const api = await startApp(t);
  const tagged = await addContact(api, "aye@example.com");
  await addContact(api, "ben@example.com");
  await addTag(api, tagged.id, "vip");
  const list = await (await api("/api/contacts?tag=vip")).json();
  assert.deepEqual(list.map((contact) => contact.id), [tagged.id]);
});

test("tags: a tag on one contact does not block it on another", async (t) => {
  const api = await startApp(t);
  const first = await addContact(api, "aye@example.com");
  const second = await addContact(api, "ben@example.com");
  await addTag(api, first.id, "vip");
  const response = await addTag(api, second.id, "vip");
  assert.ok(response.status >= 200 && response.status < 300, `status ${response.status}`);
});
