'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { leadsApi, commentsApi } from '@/lib/api';
import type { Comment, Lead, LeadStatus } from '@/types/lead';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/types/lead';

const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'WON', 'LOST'];

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [l, c] = await Promise.all([leadsApi.get(id), commentsApi.list(id)]);
        setLead(l);
        setComments(c);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleStatusChange(status: LeadStatus) {
    if (!lead) return;
    try {
      const updated = await leadsApi.update(id, { status });
      setLead(updated);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await leadsApi.delete(id);
      router.push('/leads');
    } catch (e) {
      alert((e as Error).message);
      setDeleting(false);
    }
  }

  if (loading) return <div className="p-8 text-zinc-400">Loading…</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!lead) return null;

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <Link href="/leads" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
          ← Back to leads
        </Link>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">{lead.name}</h1>
              <p className="text-zinc-500">{lead.email}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <Field label="Company" value={lead.company ?? '—'} />
            <Field label="Value" value={lead.value != null ? `$${lead.value.toLocaleString()}` : '—'} />
            <Field label="Created" value={new Date(lead.createdAt).toLocaleString()} />
            <Field label="Updated" value={new Date(lead.updatedAt).toLocaleString()} />
            {lead.notes && <div className="col-span-2"><Field label="Notes" value={lead.notes} /></div>}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">Status:</span>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${LEAD_STATUS_COLORS[lead.status]}`}>
              {LEAD_STATUS_LABELS[lead.status]}
            </span>
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
              className="rounded-lg border border-zinc-300 px-2 py-1 text-sm focus:outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Comments */}
        <CommentsSection
          leadId={id}
          comments={comments}
          onAdded={(c) => setComments((prev) => [...prev, c])}
        />
      </div>

      {editing && (
        <EditLeadModal
          lead={lead}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setLead(updated);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-400 uppercase tracking-wide">{label}</p>
      <p className="text-zinc-800">{value}</p>
    </div>
  );
}

function CommentsSection({
  leadId,
  comments,
  onAdded,
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
      const c = await commentsApi.create(leadId, text.trim());
      onAdded(c);
      setText('');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">Comments ({comments.length})</h2>

      <div className="mb-4 flex flex-col gap-3">
        {comments.length === 0 ? (
          <p className="text-sm text-zinc-400">No comments yet.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="rounded-lg bg-zinc-50 px-4 py-3">
              <p className="text-sm text-zinc-800">{c.text}</p>
              <p className="mt-1 text-xs text-zinc-400">{new Date(c.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          maxLength={500}
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={saving || !text.trim()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {saving ? '…' : 'Post'}
        </button>
      </form>
    </div>
  );
}

function EditLeadModal({
  lead,
  onClose,
  onSaved,
}: {
  lead: Lead;
  onClose: () => void;
  onSaved: (l: Lead) => void;
}) {
  const [form, setForm] = useState({
    name: lead.name,
    email: lead.email,
    company: lead.company ?? '',
    value: lead.value != null ? String(lead.value) : '',
    notes: lead.notes ?? '',
    status: lead.status,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await leadsApi.update(lead.id, {
        name: form.name,
        email: form.email,
        company: form.company || undefined,
        value: form.value ? Number(form.value) : undefined,
        notes: form.notes || undefined,
        status: form.status,
      } as Partial<Lead>);
      onSaved(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Edit Lead</h2>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          <input required type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input" />
          <input type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="input" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })} className="input">
            {STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
          </select>
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="input resize-none" />
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
