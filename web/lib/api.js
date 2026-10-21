export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const coverSrc = (url) => (url ? `${API}${url}` : null);

// REST: ส่ง FormData (multipart) หรือ JSON, โยน Error ถ้า response ไม่ ok
export async function rest(path, { method = 'GET', body, json } = {}) {
  const res = await fetch(`${API}/api/books${path}`, {
    method,
    body: json ? JSON.stringify(json) : body,
    headers: json ? { 'Content-Type': 'application/json' } : undefined,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

// GraphQL: ใช้ดึงหนังสือพร้อมรีวิว (REST ไม่ส่งรีวิวกลับมา)
export async function gql(query, variables) {
  const res = await fetch(`${API}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  const { data, errors } = await res.json();
  if (errors) throw new Error(errors[0].message);
  return data;
}
