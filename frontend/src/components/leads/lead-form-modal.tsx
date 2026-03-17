'use client';

import { useState } from 'react';
import { leadsApi } from '@/lib/api';
import type { Lead, LeadStatus } from '@/types/lead';
import { LEAD_STATUS_LABELS } from '@/types/lead';

const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'WON', 'LOST'];

export function LeadFormModal({ lead, onClose, onSaved }: {
  lead?: Lead;
  onClose: () => void;
  onSaved: (lead: Lead) => void;
}) {
  const isEdit = !!lead;

  const [form, setForm] = useState({
    name: lead?.name ?? '',
    email: lead?.email ?? '',
    company: lead?.company ?? '',
    value: lead?.value != null ? String(lead.value) : '',
    notes: lead?.notes ?? '',
    status: lead?.status ?? ('NEW' as LeadStatus),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      email: form.email,
      company: form.company || undefined,
      value: form.value ? Number(form.value) : undefined,
      notes: form.notes || undefined,
      status: form.status,
    } as Partial<Lead>;

    try {
      const result = isEdit
        ? await leadsApi.update(lead!.id, payload)
        : await leadsApi.create(payload);
      onSaved(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">{isEdit ? 'Edit Lead' : 'New Lead'}</h3>
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
              {saving ? <span className="loading loading-spinner loading-sm" /> : isEdit ? 'Save' : 'Create'}
            </button>
            <button type="button" onClick={onClose} className="btn flex-1">Cancel</button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
