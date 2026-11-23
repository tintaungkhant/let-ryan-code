import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { openDb } from "./db.js";
import { migrate } from "./migrate.js";
import { listContacts, getContact, createContact, deleteContact, ValidationError, ConflictError } from "./contacts.js";
import { formatContact } from "./format.js";
import { toCsv } from "./export.js";

function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "content-type": type });
  res.end(body === undefined ? "" : type === "application/json" ? JSON.stringify(body) : body);
}

async function readJson(req) {
  let text = "";
  for await (const chunk of req) text += chunk;
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new ValidationError("body must be JSON");
  }
}

export function createApp(db) {
  return createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    const idMatch = url.pathname.match(/^\/api\/contacts\/(\d+)$/);
    try {
      if (req.method === "GET" && url.pathname === "/api/contacts") {
        return send(res, 200, listContacts(db).map(formatContact));
      }
      if (req.method === "POST" && url.pathname === "/api/contacts") {
        return send(res, 201, formatContact(createContact(db, await readJson(req))));
      }
      if (req.method === "GET" && url.pathname === "/api/contacts.csv") {
        return send(res, 200, toCsv(listContacts(db).map(formatContact)), "text/csv");
      }
      if (idMatch && req.method === "GET") {
        const contact = getContact(db, Number(idMatch[1]));
        return contact ? send(res, 200, formatContact(contact)) : send(res, 404, { error: "not found" });
      }
      if (idMatch && req.method === "DELETE") {
        return deleteContact(db, Number(idMatch[1])) ? send(res, 204) : send(res, 404, { error: "not found" });
      }
      send(res, 404, { error: "not found" });
    } catch (error) {
      if (error instanceof ValidationError) return send(res, 400, { error: error.message });
      if (error instanceof ConflictError) return send(res, 409, { error: error.message });
      console.error(error);
      send(res, 500, { error: "internal error" });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = openDb();
  migrate(db);
  const port = Number(process.env.PORT ?? 3000);
  createApp(db).listen(port, () => console.log(`tiny-crm on http://localhost:${port}`));
}
