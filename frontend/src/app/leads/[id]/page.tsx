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
        <LeadFormModal
          lead={lead}
          onClose={() => setEditing(false)}
          onSaved={(updated) => { setLead(updated); setEditing(false); }}
        />
      )}
    </div>
  );
}
