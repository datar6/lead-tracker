'use client';

import { useEffect, useState, useCallback } from 'react';
import { leadsApi } from '@/lib/api';
import type { LeadsQuery, LeadStatus, PaginatedLeads } from '@/types/lead';
import { StatCards } from '@/components/leads/stat-cards';
import { LeadsToolbar } from '@/components/leads/leads-toolbar';
import { LeadsTable } from '@/components/leads/leads-table';
import { LeadFormModal } from '@/components/leads/lead-form-modal';
import { Pagination } from '@/components/ui/pagination';

const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'WON', 'LOST'];

type StatusCounts = Record<LeadStatus, number>;

export default function LeadsPage() {
  const [result, setResult] = useState<PaginatedLeads | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<LeadsQuery>({ page: 1, limit: 20, sort: 'createdAt', order: 'desc' });
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [counts, setCounts] = useState<StatusCounts | null>(null);

  const fetchLeads = useCallback(async (q: LeadsQuery) => {
    setLoading(true);
    setError(null);
    try {
      setResult(await leadsApi.list(q));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all(
      STATUSES.map((s) => leadsApi.list({ status: s, limit: 1 }).then((r) => [s, r.total] as const))
    ).then((entries) => setCounts(Object.fromEntries(entries) as StatusCounts));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchLeads({ ...query, q: search || undefined, page: 1 }), 300);
    return () => clearTimeout(t);
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
  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="min-h-screen bg-base-200">
      {/* Top bar */}
      <header className="bg-base-100 border-b border-base-300">
        <div className="mx-auto max-w-7xl px-8 py-5 flex items-center justify-between gap-4">
          <div className="shrink-0">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              <h1 className="text-2xl font-bold tracking-tight text-base-content">LeadTracker</h1>
            </div>
            <p className="text-sm text-base-content/40 mt-0.5 pl-8">
              Your sales pipeline at a glance
              {total > 0 && <> · <span className="text-base-content/60 font-medium">{total} leads</span></>}
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm px-5 rounded-full shrink-0 gap-1.5"
            onClick={() => setShowCreate(true)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Lead
          </button>
        </div>

        <StatCards
          counts={counts}
          total={total}
          activeStatus={query.status}
          onStatusToggle={(status) => setFilter({ status: query.status === status ? undefined : status })}
        />
      </header>

      <div className="mx-auto max-w-7xl px-8 py-6 space-y-4">
        <LeadsToolbar
          search={search}
          onSearchChange={setSearch}
          sortValue={`${query.sort}:${query.order}`}
          onSortChange={(sort, order) => setFilter({ sort, order })}
          limit={query.limit ?? 20}
          onLimitChange={(limit) => setFilter({ limit })}
        />

        {error && (
          <div role="alert" className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <LeadsTable
          data={result?.data ?? []}
          total={result?.total ?? 0}
          loading={loading}
          limit={query.limit ?? 20}
        />

        {result && result.total > 0 && (
          <Pagination
            page={query.page ?? 1}
            totalPages={totalPages}
            total={result.total}
            limit={query.limit ?? 20}
            onPageChange={(p) => setQuery((prev) => ({ ...prev, page: p }))}
          />
        )}
      </div>

      {showCreate && (
        <LeadFormModal
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); fetchLeads({ ...query, q: search || undefined }); }}
        />
      )}
    </div>
  );
}
