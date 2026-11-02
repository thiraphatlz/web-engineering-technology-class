'use client';
import { useCallback, useEffect, useState } from 'react';
import { call } from '@/lib/api';

export default function Categories() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const load = useCallback(() => call('/categories').then(setItems).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  async function run(fn) {
    try { await fn(); setError(''); load(); } catch (e) { setError(e.message); }
  }
  const add = (e) => {
    e.preventDefault();
    const form = e.currentTarget; // เก็บไว้ก่อน เพราะหลัง await ค่า currentTarget จะหาย
    run(async () => {
      await call('/categories', { method: 'POST', json: { name: new FormData(form).get('name') } });
      form.reset();
    });
  };
  const rename = (c) => {
    const name = prompt('ชื่อใหม่', c.name);
    if (name) run(() => call(`/categories/${c.id}`, { method: 'PUT', json: { name } }));
  };
  const remove = (c) =>
    confirm(`ลบ "${c.name}" และสินค้า ${c._count.products} ชิ้นในหมวด?`) &&
    run(() => call(`/categories/${c.id}`, { method: 'DELETE' }));

  return (
    <>
      <form onSubmit={add} className="box">
        <input name="name" placeholder="ชื่อหมวดหมู่" required />
        <button className="btn">เพิ่ม</button>
      </form>
      {error && <p className="error">{error}</p>}
      {items.map((c) => (
        <div key={c.id} className="box">
          <b>{c.name}</b> <span className="muted">({c._count.products})</span>
          <button className="btn ghost" onClick={() => rename(c)}>แก้ไข</button>
          <button className="btn danger" onClick={() => remove(c)}>ลบ</button>
        </div>
      ))}
    </>
  );
}
