'use client';
import { useState } from 'react';
import { rest } from '@/lib/api';

export default function ReviewForm({ bookId, onDone }) {
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const { rating, comment } = Object.fromEntries(new FormData(form));
    try {
      await rest(`/${bookId}/reviews`, { method: 'POST', json: { rating, comment } });
      form.reset();
      setError('');
      onDone();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="reviewform" onSubmit={onSubmit}>
      <select name="rating" defaultValue="5" aria-label="คะแนน">
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
      </select>
      <input name="comment" placeholder="เขียนความเห็น…" required />
      <button className="btn">ส่ง</button>
      {error && <span className="error">{error}</span>}
    </form>
  );
}
