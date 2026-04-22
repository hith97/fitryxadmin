import { AUTH_TOKEN_STORAGE_KEY } from '../config/auth';
import { API_BASE_URL } from '../config/api';

const parseResponse = async (res) => {
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = typeof data === 'string' ? data : data?.message || data?.error;
    throw new Error(msg || 'Request failed.');
  }
  return data;
};

const request = async (endpoint, { method = 'GET', body, query } = {}) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
  Object.entries(query || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  return parseResponse(res);
};

// ── Business Profile ─────────────────────────────────────────────
export const businessApi = {
  getProfile: () => request('/partner/settings'),
  updateProfile: (data) => request('/partner/profile', { method: 'PATCH', body: data }),
};

// ── Image Upload ──────────────────────────────────────────────────
export const uploadApi = {
  uploadImage: async (file) => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/partner/upload`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Upload failed');
    return data; // { url: '/uploads/filename.ext' }
  },
};

// ── Membership Categories (public) ──────────────────────────────
export const membershipCategoryApi = {
  list: () => request('/categories/membership-categories/list'),
};

// ── Plans ────────────────────────────────────────────────────────
export const planApi = {
  list: () => request('/partner/plans'),

  create: (data) => request('/partner/plans', { method: 'POST', body: data }),

  update: (id, data) => request(`/partner/plans/${id}`, { method: 'PATCH', body: data }),

  toggle: (id) => request(`/partner/plans/${id}/toggle`, { method: 'PATCH' }),

  remove: (id) => request(`/partner/plans/${id}`, { method: 'DELETE' }),
};

// ── Classes ──────────────────────────────────────────────────────
export const classApi = {
  list: () => request('/partner/classes'),

  get: (id) => request(`/partner/classes/${id}`),

  create: (data) => request('/partner/classes', { method: 'POST', body: data }),

  update: (id, data) => request(`/partner/classes/${id}`, { method: 'PATCH', body: data }),

  toggle: (id) => request(`/partner/classes/${id}/toggle`, { method: 'PATCH' }),

  remove: (id) => request(`/partner/classes/${id}`, { method: 'DELETE' }),
};

// ── Subscriptions ────────────────────────────────────────────────
export const subscriptionApi = {
  list: (query = {}) => request('/partner/subscriptions', { query }),

  create: (data) => request('/partner/subscriptions', { method: 'POST', body: data }),

  renew: (id, data) => request(`/partner/subscriptions/${id}/renew`, { method: 'PATCH', body: data }),

  cancel: (id) => request(`/partner/subscriptions/${id}/cancel`, { method: 'PATCH' }),

  pause: (id) => request(`/partner/subscriptions/${id}/pause`, { method: 'PATCH' }),
};

// ── Leads ────────────────────────────────────────────────────────
export const leadApi = {
  list: (query = {}) => request('/partner/leads', { query }),

  create: (data) => request('/partner/leads', { method: 'POST', body: data }),

  update: (id, data) => request(`/partner/leads/${id}`, { method: 'PATCH', body: data }),

  convert: (id, data) => request(`/partner/leads/${id}/convert`, { method: 'POST', body: data }),
};

// ── Members ──────────────────────────────────────────────────────
export const memberApi = {
  list: (query = {}) => request('/partner/members', { query }),

  get: (id) => request(`/partner/members/${id}`),

  create: (data) => request('/partner/members', { method: 'POST', body: data }),

  update: (id, data) => request(`/partner/members/${id}`, { method: 'PATCH', body: data }),

  remove: (id) => request(`/partner/members/${id}`, { method: 'DELETE' }),
};

// ── Staff ────────────────────────────────────────────────────────
export const staffApi = {
  list: () => request('/partner/staff'),

  create: (data) => request('/partner/staff', { method: 'POST', body: data }),

  update: (id, data) => request(`/partner/staff/${id}`, { method: 'PATCH', body: data }),

  updateStatus: (id, status) =>
    request(`/partner/staff/${id}/status`, { method: 'PATCH', body: { status } }),

  remove: (id) => request(`/partner/staff/${id}`, { method: 'DELETE' }),
};
