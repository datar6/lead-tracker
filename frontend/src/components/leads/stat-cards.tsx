import type { LeadStatus } from '@/types/lead';
import { LEAD_STATUS_LABELS } from '@/types/lead';

type StatusCounts = Record<LeadStatus, number>;

const STAT_CONFIG: { status: LeadStatus; stroke: string; text: string; gradient: string; icon: React.ReactNode }[] = [
  {
    status: 'NEW', stroke: '#64a5c4', text: 'text-slate-500',
    gradient: 'from-slate-50 to-slate-100/80',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
  },
  {
    status: 'CONTACTED', stroke: '#8fa7b8', text: 'text-slate-500',
    gradient: 'from-slate-50 to-blue-50/60',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />,
  },
  {
    status: 'IN_PROGRESS', stroke: '#8b9eb8', text: 'text-slate-500',
    gradient: 'from-slate-50 to-indigo-50/50',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />,
  },
  {
    status: 'WON', stroke: '#6aaa8e', text: 'text-slate-500',
    gradient: 'from-slate-50 to-teal-50/60',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />,
  },
  {
    status: 'LOST', stroke: '#b09090', text: 'text-slate-500',
    gradient: 'from-slate-50 to-rose-50/40',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />,
  },
];

export function StatCards({
  counts,
  total,
  activeStatus,
  onStatusToggle,
}: {
  counts: StatusCounts | null;
  total: number;
  activeStatus?: LeadStatus;
  onStatusToggle: (status: LeadStatus) => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-8 pb-5 grid grid-cols-5 gap-3">
      {STAT_CONFIG.map(({ status, stroke, text, gradient, icon }) => {
        const count = counts?.[status] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        const r = 20;
        const circ = 2 * Math.PI * r;
        const dash = (pct / 100) * circ;
        const isActive = activeStatus === status;
        return (
          <button
            key={status}
            onClick={() => onStatusToggle(status)}
            style={isActive ? { borderColor: stroke } : undefined}
            className={[
              'group relative flex flex-col overflow-hidden rounded-2xl cursor-pointer select-none text-left',
              `bg-gradient-to-br ${gradient}`,
              'border-2 transition-all duration-200 ease-out',
              isActive ? 'shadow-lg' : 'border-transparent',
              !isActive ? 'hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/15 hover:brightness-95 hover:saturate-150' : '',
            ].join(' ')}
          >
            {/* Top: ring + count */}
            <div className="flex items-start gap-3 p-4 pb-3">
              <div className="shrink-0">
                <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
                  <circle cx="26" cy="26" r={r} fill="none" stroke={stroke} strokeWidth="3.5" opacity="0.18" />
                  <circle
                    cx="26" cy="26" r={r} fill="none"
                    stroke={stroke} strokeWidth="3.5"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 26 26)"
                    style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1)' }}
                  />
                  <g transform="translate(14, 14)">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {icon}
                    </svg>
                  </g>
                </svg>
              </div>
              <div className={`flex flex-col justify-center min-w-0 pt-0.5 ${text}`}>
                <p className="text-3xl font-black leading-none tabular-nums tracking-tight">
                  {counts ? count : <span className="loading loading-dots loading-sm" />}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-widest opacity-60 mt-1.5 truncate">
                  {LEAD_STATUS_LABELS[status]}
                </p>
              </div>
            </div>
            {/* Bottom: % + bar */}
            <div className="px-4 pb-4 mt-auto">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[11px] font-medium tabular-nums ${text} opacity-50`}>
                  {counts ? `${Math.round(pct)}%` : '—'}
                </span>
                <span className={`text-[10px] font-medium ${text} opacity-35`}>of total</span>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden bg-black/[0.08]">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${pct}%`, backgroundColor: stroke, opacity: 0.75 }}
                />
              </div>
            </div>
            {/* Active glow */}
            {isActive && (
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{ background: `radial-gradient(ellipse at 30% 40%, ${stroke}22 0%, transparent 70%)` }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
