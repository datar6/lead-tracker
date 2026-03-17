'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { leadsApi, commentsApi } from '@/lib/api';
import type { Comment, Lead, LeadStatus } from '@/types/lead';
import { LEAD_STATUS_LABELS } from '@/types/lead';

const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'WON', 'LOST'];

const STATUS_BADGE: Record<LeadStatus, string> = {
  NEW: 'badge-info',
  CONTACTED: 'badge-warning',
  IN_PROGRESS: 'badge-secondary',
  WON: 'badge-success',
  LOST: 'badge-error',
};

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
      setLead(await leadsApi.update(id, { status }));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 p-6">
        <div role="alert" className="alert alert-error max-w-lg mx-auto">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="mx-auto max-w-3xl">

        <Link href="/leads" className="btn btn-ghost btn-sm mb-4 gap-1">
          ← Back to leads
        </Link>

        {/* Lead card */}
        <div className="card bg-base-100 shadow-sm mb-6">
          <div className="card-body">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="card-title text-2xl">{lead.name}</h1>
                <p className="text-base-content/60">{lead.email}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Edit</button>
                <button className="btn btn-error btn-sm" disabled={deleting} onClick={handleDelete}>
                  {deleting ? <span className="loading loading-spinner loading-xs" /> : 'Delete'}
                </button>
              </div>
            </div>

            <div className="divider my-2" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Company" value={lead.company ?? '—'} />
              <Field label="Value" value={lead.value != null ? `$${lead.value.toLocaleString()}` : '—'} />
              <Field label="Created" value={new Date(lead.createdAt).toLocaleString()} />
              <Field label="Updated" value={new Date(lead.updatedAt).toLocaleString()} />
              {lead.notes && <div className="col-span-2"><Field label="Notes" value={lead.notes} /></div>}
            </div>

            <div className="divider my-2" />

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-base-content/60">Status:</span>
              <span className={`badge ${STATUS_BADGE[lead.status]}`}>
                {LEAD_STATUS_LABELS[lead.status]}
              </span>
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                className="select select-bordered select-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
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
          onSaved={(updated) => { setLead(updated); setEditing(false); }}
        />
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-base-content/40 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-base-content">{value}</p>
    </div>
  );
}

function CommentsSection({
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

function EditLeadModal({ lead, onClose, onSaved }: {
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
      onSaved(await leadsApi.update(lead.id, {
        name: form.name,
        email: form.email,
        company: form.company || undefined,
        value: form.value ? Number(form.value) : undefined,
        notes: form.notes || undefined,
        status: form.status,
      } as Partial<Lead>));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">Edit Lead</h3>
        {error && <div role="alert" className="alert alert-error mb-3 text-sm"><span>{error}</span></div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input input-bordered w-full" />
          <input required type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input input-bordered w-full" />
          <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input input-bordered w-full" />
          <input type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="input input-bordered w-full" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })} className="select select-bordered w-full">
            {STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
          </select>
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="textarea textarea-bordered w-full" />
          <div className="modal-action mt-0">
            <button type="submit" disabled={saving} className="btn btn-primary flex-1">
              {saving ? <span className="loading loading-spinner loading-sm" /> : 'Save'}
            </button>
            <button type="button" onClick={onClose} className="btn flex-1">Cancel</button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
