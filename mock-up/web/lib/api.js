export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const img = (url) => (url ? API + url : null);

// ส่ง JSON ผ่าน json: {...}  หรือส่งไฟล์ผ่าน body: FormData
export async function call(path, { method = 'GET', body, json } = {}) {
  const res = await fetch(`${API}/api${path}`, {
    method,
    body: json ? JSON.stringify(json) : body,
    headers: json ? { 'Content-Type': 'application/json' } : undefined, // FormData ห้ามตั้ง Content-Type เอง
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({})); // 204 ไม่มี body
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}
