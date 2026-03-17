export function Pagination({
  page, totalPages, total, limit, onPageChange, compact = false,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
  compact?: boolean;
}) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages: (number | '...')[] = [];
  const add = new Set<number>();
  [1, totalPages, page - 1, page, page + 1].forEach((p) => {
    if (p >= 1 && p <= totalPages) add.add(p);
  });
  const sorted = Array.from(add).sort((a, b) => a - b);
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) pages.push('...');
    pages.push(p);
  });

  return (
    <div className={compact ? 'flex items-center gap-1' : 'flex items-center justify-between py-1'}>
      {!compact && (
        <p className="text-sm text-base-content/40">
          Showing <span className="font-medium text-base-content/60">{from}–{to}</span> of{' '}
          <span className="font-medium text-base-content/60">{total}</span>
        </p>
      )}
      <div className="flex items-center gap-1">
        <button
          className="btn btn-sm btn-ghost rounded-full px-4 text-base-content/60"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Prev
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="w-8 text-center text-base-content/30 text-sm select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              disabled={p === page}
              className={`btn btn-sm min-w-9 rounded-full ${p === page ? 'btn-primary shadow-sm' : 'btn-ghost text-base-content/60'}`}
            >
              {p}
            </button>
          )
        )}
        <button
          className="btn btn-sm btn-ghost rounded-full px-4 text-base-content/60"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
