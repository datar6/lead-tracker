import type { LeadsQuery } from '@/types/lead';

export function LeadsToolbar({
  search,
  onSearchChange,
  sortValue,
  onSortChange,
  limit,
  onLimitChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  sortValue: string;
  onSortChange: (sort: LeadsQuery['sort'], order: LeadsQuery['order']) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Search */}
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search name, email, company…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input input-sm w-full pl-9 rounded-full bg-base-100 shadow-sm"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <select
          value={sortValue}
          onChange={(e) => {
            const [sort, order] = e.target.value.split(':') as [LeadsQuery['sort'], LeadsQuery['order']];
            onSortChange(sort, order);
          }}
          className="select select-sm rounded-full bg-base-100 shadow-sm"
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="updatedAt:desc">Recently updated</option>
          <option value="updatedAt:asc">Least recently updated</option>
        </select>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="select select-sm rounded-full bg-base-100 shadow-sm w-28"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>
    </div>
  );
}
