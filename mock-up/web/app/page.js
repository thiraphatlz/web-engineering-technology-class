'use client';
import { useCallback, useEffect, useState } from 'react';
import { call, img } from '@/lib/api';
import ProductForm from '@/components/ProductForm';

export default function Home() {
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(
    () => Promise.all([call(`/products${filter ? `?categoryId=${filter}` : ''}`), call('/categories')])
      .then(([p, c]) => { setProducts(p); setCategories(c); setError(''); })
      .catch((e) => setError(e.message)),
    [filter],
  );
  useEffect(() => { load(); }, [load]);

  async function remove(p) {
    if (!confirm(`ลบ "${p.name}" ?`)) return;
    try { await call(`/products/${p.id}`, { method: 'DELETE' }); load(); } catch (e) { setError(e.message); }
  }

  return (
    <>
      <section className="box">
        <h2>เพิ่มสินค้า</h2>
        <ProductForm categories={categories} onDone={load} />
      </section>

      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">ทุกหมวดหมู่</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {error && <p className="error">{error}</p>}
      {products?.map((p) => (
        <article key={p.id} className="box">
          {editing === p.id ? (
            <ProductForm product={p} categories={categories}
              onDone={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />
          ) : (
            <>
              {p.imageUrl && <img src={img(p.imageUrl)} alt="" width="60" />}
              <b>{p.name}</b> {p.price} ฿ <span className="muted">[{p.category.name}]</span>
              <button className="btn ghost" onClick={() => setEditing(p.id)}>แก้ไข</button>
              <button className="btn danger" onClick={() => remove(p)}>ลบ</button>
            </>
          )}
        </article>
      ))}
    </>
  );
}
