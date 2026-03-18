import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import type { Lead, LeadStatus } from '@/types/lead';
import { LEAD_STATUS_LABELS } from '@/types/lead';

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
  CONTACTED: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
  WON: 'bg-teal-100 text-teal-700 ring-1 ring-teal-200',
  LOST: 'bg-rose-100 text-rose-600 ring-1 ring-rose-200',
};

function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}

const columnHelper = createColumnHelper<Lead>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => (
      <span className="font-semibold text-base-content">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => <span className="text-base-content/60 text-sm">{info.getValue()}</span>,
  }),
  columnHelper.accessor('company', {
    header: 'Company',
    cell: (info) => (
      <span className="text-base-content/60 text-sm">{info.getValue() ?? <span className="text-base-content/30">—</span>}</span>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusPill status={info.getValue()} />,
  }),
  columnHelper.accessor('value', {
    header: 'Value',
    cell: (info) => (
      <span className="font-medium text-base-content/80 text-sm tabular-nums">
        {info.getValue() != null ? `$${info.getValue()!.toLocaleString()}` : <span className="text-base-content/30">—</span>}
      </span>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created',
    cell: (info) => (
      <span className="text-base-content/40 text-xs tabular-nums">
        {new Date(info.getValue()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    ),
  }),
];

const ROW_HEIGHT = 49; // px per row (py-3.5 + content)
const HEADER_HEIGHT = 45;

export function LeadsTable({
  data,
  total,
  loading,
  limit,
}: {
  data: Lead[];
  total: number;
  loading: boolean;
  limit: number;
}) {
  const router = useRouter();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total,
  });

  return (
    <div className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden">
      <div className="overflow-x-auto" style={{ minHeight: HEADER_HEIGHT + ROW_HEIGHT * limit }}>
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-base-200">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-base-content/40"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <tr
                  key={`skeleton-${i}`}
                  className={`border-b border-base-200 last:border-0 ${i % 2 === 1 ? 'bg-base-200/30' : ''}`}
                >
                  {columns.map((_, ci) => (
                    <td key={ci} className="px-5 py-3.5">
                      <div className="h-4 rounded bg-base-300/40 animate-pulse" style={{ width: ci === 0 ? '60%' : ci === 4 ? '40%' : ci === 5 ? '50%' : '70%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-20">
                  <div className="flex flex-col items-center gap-2 text-base-content/30">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span className="text-sm">No leads found</span>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/leads/${row.original.id}`)}
                  className={`border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors animate-fade-in cursor-pointer ${i % 2 === 1 ? 'bg-base-200/30' : ''}`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3.5">
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
  );
}
