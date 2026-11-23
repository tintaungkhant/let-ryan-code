const columns = ["id", "name", "email", "phone", "created_at"];

function cell(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(contacts) {
  const rows = contacts.map((contact) => columns.map((column) => cell(contact[column])).join(","));
  return [columns.join(","), ...rows].join("\n") + "\n";
}
