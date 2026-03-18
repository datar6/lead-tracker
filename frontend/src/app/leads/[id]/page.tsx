'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { leadsApi, commentsApi } from '@/lib/api';
import type { Comment, Lead, LeadStatus } from '@/types/lead';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/types/lead';
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

  if (loading) return <div className="min-h-screen bg-base-200 p-8 text-base-content/40">Loading…</div>;
  if (error) return <div className="min-h-screen bg-base-200 p-8 text-error">{error}</div>;
  if (!lead) return null;

  return (
    <div className="min-h-screen bg-base-200">
      {/* Top bar */}
      <header className="bg-base-100 border-b border-base-300">
        <div className="mx-auto max-w-7xl px-8 py-5 flex items-center justify-between gap-4">
          <div className="shrink-0">
            <Link href="/leads" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              <h1 className="text-2xl font-bold tracking-tight text-base-content">LeadTracker</h1>
            </Link>
            <p className="text-sm text-base-content/40 mt-0.5 pl-8">Lead Details</p>
          </div>
          <Link href="/leads" className="btn btn-ghost btn-sm gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to leads
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-6 space-y-4">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body gap-0">
            {/* Header: name + actions */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-base-content">{lead.name}</h2>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${LEAD_STATUS_COLORS[lead.status]}`}>
                    {LEAD_STATUS_LABELS[lead.status]}
                  </span>
                </div>
                <p className="text-base-content/50 mt-0.5">{lead.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="btn btn-outline btn-sm"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn btn-error btn-sm"
                >
                  {deleting ? <span className="loading loading-spinner loading-sm" /> : 'Delete'}
                </button>
              </div>
            </div>

            <div className="divider my-3" />

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-sm">
              <Field label="Company" value={lead.company ?? '—'} />
              <Field label="Value" value={lead.value != null ? `$${lead.value.toLocaleString()}` : '—'} />
              <Field label="Created" value={new Date(lead.createdAt).toLocaleString()} />
              <Field label="Updated" value={new Date(lead.updatedAt).toLocaleString()} />
            </div>

            <div className="divider my-3" />

            {/* Notes + Status change */}
            <div className="flex items-start justify-around gap-4">
              {lead.notes && (
                <Field label="Notes" value={lead.notes} />
              )}

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-medium text-base-content/60 whitespace-nowrap">Change status:</span>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                  className="select-sm select w-full"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
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
          onSaved={(updated) => {
            setLead(updated);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}
