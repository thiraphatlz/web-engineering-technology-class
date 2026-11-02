'use client';
import { useState } from 'react';
import { call, img } from '@/lib/api';

export default function ProductForm({ product, categories, onDone, onCancel }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(img(product?.imageUrl));

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError('');
    try {
      const fd = new FormData(form); // ดึงทุกฟิลด์ในฟอร์มรวมไฟล์ตาม name=""
      if (!fd.get('image')?.size) fd.delete('image'); // ไม่เลือกไฟล์ = ไม่ส่ง = เซิร์ฟเวอร์คงรูปเดิม
      await call(product ? `/products/${product.id}` : '/products', {
        method: product ? 'PUT' : 'POST',
        body: fd,
      });
      form.reset();
      setPreview(null);
      onDone();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        {preview ? <img src={preview} alt="" width="80" /> : <span>+ รูปสินค้า</span>}
        <input
          name="image"
          type="file"
          hidden
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files[0] && setPreview(URL.createObjectURL(e.target.files[0]))}
        />
      </label>
      <input name="name" placeholder="ชื่อสินค้า" required defaultValue={product?.name} />
      <input name="price" type="number" step="0.01" min="0" placeholder="ราคา" required defaultValue={product?.price} />
      <select name="categoryId" required defaultValue={product?.categoryId ?? ''}>
        <option value="" disabled>เลือกหมวดหมู่</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {error && <span className="error">{error}</span>}
      <button className="btn" disabled={busy}>{product ? 'บันทึก' : 'เพิ่ม'}</button>
      {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>ยกเลิก</button>}
    </form>
  );
}
