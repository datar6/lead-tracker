export function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-base-content/40 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-base-content">{value}</p>
    </div>
  );
}
