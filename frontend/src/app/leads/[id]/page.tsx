'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { leadsApi, commentsApi } from '@/lib/api';
import type { Comment, Lead, LeadStatus } from '@/types/lead';
import { LEAD_STATUS_LABELS } from '@/types/lead';
import { Field } from '@/components/leads/field';
import { CommentsSection } from '@/components/leads/comments-section';
import { LeadFormModal } from '@/components/leads/lead-form-modal';

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
        <LeadFormModal
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
