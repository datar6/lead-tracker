'use client';

import { useState } from 'react';
import { commentsApi } from '@/lib/api';
import type { Comment } from '@/types/lead';

export function CommentsSection({
  leadId, comments, onAdded,
}: {
  leadId: string;
  comments: Comment[];
  onAdded: (c: Comment) => void;
}) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      onAdded(await commentsApi.create(leadId, text.trim()));
      setText('');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-lg">Comments ({comments.length})</h2>

        {comments.length === 0 ? (
          <p className="text-base-content/40 text-sm py-2">No comments yet.</p>
        ) : (
          <div className="flex flex-col gap-3 my-2">
            {comments.map((c) => (
              <div key={c.id} className="bg-base-200 rounded-box px-4 py-3">
                <p className="text-sm text-base-content">{c.text}</p>
                <p className="text-xs text-base-content/40 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            maxLength={500}
            className="input input-bordered flex-1"
          />
          <button
            type="submit"
            disabled={saving || !text.trim()}
            className="btn btn-primary"
          >
            {saving ? <span className="loading loading-spinner loading-sm" /> : 'Post'}
          </button>
        </form>
      </div>
    </div>
  );
}
