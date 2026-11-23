import { openDb } from "../src/db.js";
import { migrate } from "../src/migrate.js";
import { createContact } from "../src/contacts.js";

const db = openDb();
migrate(db);
for (const contact of [
  { name: "Aye Aye", email: "aye@example.com", phone: "+95 9 111 111" },
  { name: "Ben Ho", email: "ben@example.com", phone: "+65 8111 2222" },
  { name: "Chen Li", email: "chen@example.com" },
]) {
  try {
    createContact(db, contact);
  } catch {
    // already seeded
  }
}
db.prepare("UPDATE contacts SET fax = ? WHERE email = ?").run("+95 1 234 567", "aye@example.com");
console.log("seeded");
