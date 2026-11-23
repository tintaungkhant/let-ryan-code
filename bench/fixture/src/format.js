export function formatContact(row) {
  return { id: row.id, name: row.name, email: row.email, phone: row.phone, created_at: row.created_at };
}
