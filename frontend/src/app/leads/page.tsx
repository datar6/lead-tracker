'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { leadsApi } from '@/lib/api';
import type { Lead, LeadsQuery, LeadStatus, PaginatedLeads } from '@/types/lead';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/types/lead';

const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'WON', 'LOST'];

export default function LeadsPage() {
  const [result, setResult] = useState<PaginatedLeads | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState<LeadsQuery>({
    page: 1,
    limit: 20,
    sort: 'createdAt',
    order: 'desc',
  });
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchLeads = useCallback(async (q: LeadsQuery) => {
    setLoading(true);
    setError(null);
    try {
      const data = await leadsApi.list(q);
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads({ ...query, q: search || undefined, page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, query.status, query.sort, query.order, query.limit]);

  useEffect(() => {
    fetchLeads({ ...query, q: search || undefined });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.page]);

  function setFilter(patch: Partial<LeadsQuery>) {
    setQuery((prev) => ({ ...prev, ...patch, page: 1 }));
  }

  const totalPages = result ? Math.ceil(result.total / (query.limit ?? 20)) : 1;

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900">Leads</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            + New Lead
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search name, email, company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 w-64"
          />
          <select
            value={query.status ?? ''}
            onChange={(e) => setFilter({ status: (e.target.value as LeadStatus) || undefined })}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select
            value={`${query.sort}:${query.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split(':') as [LeadsQuery['sort'], LeadsQuery['order']];
              setFilter({ sort, order });
            }}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="updatedAt:desc">Recently updated</option>
            <option value="updatedAt:asc">Least recently updated</option>
          </select>
          <select
            value={query.limit}
            onChange={(e) => setFilter({ limit: Number(e.target.value) })}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>

        {/* Table */}
        {error && <p className="mb-4 text-red-600">{error}</p>}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-400">Loading…</td></tr>
              ) : result?.data.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-400">No leads found</td></tr>
              ) : (
                result?.data.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      <Link href={`/leads/${lead.id}`} className="hover:underline">{lead.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{lead.email}</td>
                    <td className="px-4 py-3 text-zinc-600">{lead.company ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${LEAD_STATUS_COLORS[lead.status]}`}>
                        {LEAD_STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {lead.value != null ? `$${lead.value.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {result && result.total > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
            <span>
              {(((query.page ?? 1) - 1) * (query.limit ?? 20)) + 1}–
              {Math.min((query.page ?? 1) * (query.limit ?? 20), result.total)} of {result.total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={(query.page ?? 1) <= 1}
                onClick={() => setQuery((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
                className="rounded px-3 py-1 border border-zinc-300 disabled:opacity-40 hover:bg-zinc-100"
              >
                Previous
              </button>
              <button
                disabled={(query.page ?? 1) >= totalPages}
                onClick={() => setQuery((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
                className="rounded px-3 py-1 border border-zinc-300 disabled:opacity-40 hover:bg-zinc-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateLeadModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchLeads({ ...query, q: search || undefined });
          }}
        />
      )}
    </div>
  );
}

function CreateLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', value: '', notes: '', status: 'NEW' as LeadStatus });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await leadsApi.create({
        name: form.name,
        email: form.email,
        company: form.company || undefined,
        value: form.value ? Number(form.value) : undefined,
        notes: form.notes || undefined,
        status: form.status,
      } as Partial<Lead>);
      onCreated();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">New Lead</h2>
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
              {saving ? 'Saving…' : 'Create'}
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
