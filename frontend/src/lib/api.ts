import type { Comment, Lead, LeadsQuery, PaginatedLeads } from '@/types/lead';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const leadsApi = {
  list(query: LeadsQuery = {}): Promise<PaginatedLeads> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    const qs = params.toString();
    return request<PaginatedLeads>(`/leads${qs ? `?${qs}` : ''}`);
  },

  get(id: string): Promise<Lead> {
    return request<Lead>(`/leads/${id}`);
  },

  create(data: Partial<Lead>): Promise<Lead> {
    return request<Lead>('/leads', { method: 'POST', body: JSON.stringify(data) });
  },

  update(id: string, data: Partial<Lead>): Promise<Lead> {
    return request<Lead>(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  delete(id: string): Promise<void> {
    return request<void>(`/leads/${id}`, { method: 'DELETE' });
  },
};

export const commentsApi = {
  list(leadId: string): Promise<Comment[]> {
    return request<Comment[]>(`/leads/${leadId}/comments`);
  },

  create(leadId: string, text: string): Promise<Comment> {
    return request<Comment>(`/leads/${leadId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },
};
