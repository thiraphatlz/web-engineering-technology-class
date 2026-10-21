'use client';
import { useCallback, useEffect, useState } from 'react';
import { gql, rest, coverSrc } from '@/lib/api';
import BookForm from '@/components/BookForm';
import ReviewForm from '@/components/ReviewForm';

const QUERY = `{ books { id title author coverUrl reviews { id rating comment } } }`;

export default function Home() {
  const [books, setBooks] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // id ที่กำลังแก้ไข
  const [open, setOpen] = useState(null); // id ที่เปิดดูรีวิว

  const load = useCallback(
    () => gql(QUERY).then((d) => { setBooks(d.books); setError(''); }).catch((e) => setError(e.message)),
    [],
  );
  useEffect(() => { load(); }, [load]);

  async function remove(b) {
    if (!confirm(`ลบ "${b.title}" ?`)) return;
    try { await rest(`/${b.id}`, { method: 'DELETE' }); load(); } catch (e) { setError(e.message); }
  }

  return (
    <>
      <section className="box">
        <h2>เพิ่มหนังสือ</h2>
        <BookForm onDone={load} />
      </section>

      {error && <p className="error">{error}</p>}
      {!books && !error && <p className="muted">กำลังโหลด…</p>}
      {books?.length === 0 && <p className="muted">ยังไม่มีหนังสือ — เพิ่มเล่มแรกด้านบนได้เลย</p>}

      {books?.map((b) => (
        <article key={b.id} className="box">
          {editing === b.id ? (
            <BookForm book={b} onDone={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />
          ) : (
            <>
              <div className="item">
                {b.coverUrl ? <img src={coverSrc(b.coverUrl)} alt="" /> : <div className="nocover">📖</div>}
                <div className="info">
                  <b>{b.title}</b>
                  <span className="muted">{b.author}</span>
                </div>
                <div className="row">
                  <button className="btn ghost" onClick={() => setOpen(open === b.id ? null : b.id)}>
                    รีวิว ({b.reviews.length})
                  </button>
                  <button className="btn ghost" onClick={() => setEditing(b.id)}>แก้ไข</button>
                  <button className="btn danger" onClick={() => remove(b)}>ลบ</button>
                </div>
              </div>
              {open === b.id && (
                <div className="reviews">
                  {b.reviews.map((r) => (
                    <p key={r.id}><span className="stars">{'★'.repeat(r.rating)}</span> {r.comment}</p>
                  ))}
                  <ReviewForm bookId={b.id} onDone={load} />
                </div>
              )}
            </>
          )}
        </article>
      ))}
    </>
  );
}
