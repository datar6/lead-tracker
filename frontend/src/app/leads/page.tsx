'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { leadsApi } from '@/lib/api';
import type { Lead, LeadsQuery, LeadStatus, PaginatedLeads } from '@/types/lead';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/types/lead';

const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'WON', 'LOST'];
const columnHelper = createColumnHelper<Lead>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => (
      <Link href={`/leads/${info.row.original.id}`} className="link link-hover font-medium">
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => <span className="text-base-content/70">{info.getValue()}</span>,
  }),
  columnHelper.accessor('company', {
    header: 'Company',
    cell: (info) => <span className="text-base-content/70">{info.getValue() ?? '—'}</span>,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor('value', {
    header: 'Value',
    cell: (info) => (
      <span className="text-base-content/70">
        {info.getValue() != null ? `$${info.getValue()!.toLocaleString()}` : '—'}
      </span>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created',
    cell: (info) => (
      <span className="text-base-content/50 text-sm">
        {new Date(info.getValue()).toLocaleDateString()}
      </span>
    ),
  }),
];

function StatusBadge({ status }: { status: LeadStatus }) {
  const colorMap: Record<LeadStatus, string> = {
    NEW: 'badge-info',
    CONTACTED: 'badge-warning',
    IN_PROGRESS: 'badge-secondary',
    WON: 'badge-success',
    LOST: 'badge-error',
  };
  return (
    <span className={`badge badge-sm ${colorMap[status]}`}>
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}

export default function LeadsPage() {
  const [result, setResult] = useState<PaginatedLeads | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<LeadsQuery>({ page: 1, limit: 20, sort: 'createdAt', order: 'desc' });
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

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

  const table = useReactTable({
    data: result?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: result?.total ?? 0,
  });

  const totalPages = result ? Math.ceil(result.total / (query.limit ?? 20)) : 1;

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-base-content">Leads</h1>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
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
            className="input input-bordered w-72"
          />
          <select
            value={query.status ?? ''}
            onChange={(e) => setFilter({ status: (e.target.value as LeadStatus) || undefined })}
            className="select select-bordered"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
          </select>
          <select
            value={`${query.sort}:${query.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split(':') as [LeadsQuery['sort'], LeadsQuery['order']];
              setFilter({ sort, order });
            }}
            className="select select-bordered"
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="updatedAt:desc">Recently updated</option>
            <option value="updatedAt:asc">Least recently updated</option>
          </select>
          <select
            value={query.limit}
            onChange={(e) => setFilter({ limit: Number(e.target.value) })}
            className="select select-bordered"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        <div className="card bg-base-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th key={header.id} className="text-base-content/60 font-medium text-sm">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12">
                      <span className="loading loading-spinner loading-md text-primary" />
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12 text-base-content/40">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-base-200 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {result && result.total > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-base-content/60">
            <span>
              {((query.page ?? 1) - 1) * (query.limit ?? 20) + 1}–
              {Math.min((query.page ?? 1) * (query.limit ?? 20), result.total)} of {result.total}
            </span>
            <div className="join">
              <button
                className="join-item btn btn-sm"
                disabled={(query.page ?? 1) <= 1}
                onClick={() => setQuery((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
              >
                «
              </button>
              <button className="join-item btn btn-sm">Page {query.page}</button>
              <button
                className="join-item btn btn-sm"
                disabled={(query.page ?? 1) >= totalPages}
                onClick={() => setQuery((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateLeadModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchLeads({ ...query, q: search || undefined }); }}
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
        name: form.name, email: form.email,
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
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">New Lead</h3>
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
              {saving ? <span className="loading loading-spinner loading-sm" /> : 'Create'}
            </button>
            <button type="button" onClick={onClose} className="btn flex-1">Cancel</button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
