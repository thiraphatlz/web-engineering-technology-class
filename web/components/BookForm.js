'use client';
import { useState } from 'react';
import { rest, coverSrc } from '@/lib/api';

// ฟอร์มเดียวใช้ทั้งเพิ่ม (ไม่มี book) และแก้ไข (มี book); ไฟล์ส่งเป็น multipart field "cover"
export default function BookForm({ book, onDone, onCancel }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(coverSrc(book?.coverUrl));

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError('');
    try {
      const fd = new FormData(form);
      if (!fd.get('cover')?.size) fd.delete('cover'); // ไม่เลือกไฟล์ = คงรูปเดิม
      await rest(book ? `/${book.id}` : '', { method: book ? 'PUT' : 'POST', body: fd });
      form.reset();
      setPreview(null);
      onDone();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <form className="bookform" onSubmit={onSubmit}>
      <label className="pick">
        {preview ? <img src={preview} alt="" /> : <span>+ รูปปก</span>}
        <input
          name="cover"
          type="file"
          hidden
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files[0] && setPreview(URL.createObjectURL(e.target.files[0]))}
        />
      </label>
      <div className="fields">
        <input name="title" placeholder="ชื่อหนังสือ" required defaultValue={book?.title} />
        <input name="author" placeholder="ผู้แต่ง" required defaultValue={book?.author} />
        {error && <span className="error">{error}</span>}
      </div>
      <div className="row">
        <button className="btn" disabled={busy}>{book ? 'บันทึก' : 'เพิ่ม'}</button>
        {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>ยกเลิก</button>}
      </div>
    </form>
  );
}
