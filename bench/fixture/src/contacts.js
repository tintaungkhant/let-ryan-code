export class ValidationError extends Error {}
export class ConflictError extends Error {}

export function listContacts(db) {
  return db.prepare("SELECT * FROM contacts ORDER BY id").all();
}

export function getContact(db, id) {
  return db.prepare("SELECT * FROM contacts WHERE id = ?").get(id) ?? null;
}

export function createContact(db, { name, email, phone = null }) {
  if (typeof name !== "string" || !name.trim()) throw new ValidationError("name is required");
  if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+$/.test(email)) throw new ValidationError("email is invalid");

  const existing = db.prepare("SELECT id FROM contacts WHERE email = ?").get(email);
  if (existing) throw new ConflictError("email already exists");

  const { lastInsertRowid } = db
    .prepare("INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)")
    .run(name.trim(), email, phone);
  return getContact(db, Number(lastInsertRowid));
}

export function deleteContact(db, id) {
  return db.prepare("DELETE FROM contacts WHERE id = ?").run(id).changes > 0;
}
