import { AUTH_TOKEN_STORAGE_KEY } from '../config/auth';
import { API_BASE_URL } from '../config/api';

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof data === 'string' ? data : data?.message || data?.error;
    throw new Error(message || 'Admin request failed.');
  }
  return data;
};

const request = async (endpoint, { method = 'GET', query, body } = {}) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  const response = await fetch(url.toString(), {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return parseResponse(response);
};

export const adminApi = {
  // Stats
  getStats: () => request('/admin/stats'),

  // Categories
  getCategories: () => request('/admin/categories'),

  // Partners
  getPartners: (query) => request('/admin/partners', { query }),
  getPartnerById: (id) => request(`/admin/partners/${id}`),
  approvePartner: (id) => request(`/admin/partners/${id}/approve`, { method: 'PATCH' }),
  rejectPartner: (id, reason) => request(`/admin/partners/${id}/reject`, { method: 'PATCH', body: { reason } }),
  suspendPartner: (id) => request(`/admin/partners/${id}/suspend`, { method: 'PATCH' }),
  pausePartner: (id) => request(`/admin/partners/${id}/pause`, { method: 'PATCH' }),
  deletePartner: (id) => request(`/admin/partners/${id}`, { method: 'DELETE' }),
  editPartner: (id, data) => request(`/admin/partners/${id}`, { method: 'PATCH', body: data }),
  getPartnerSubscription: (id) => request(`/admin/partners/${id}/subscription`),
  assignPackage: (partnerId, packageId) => request(`/admin/partners/${partnerId}/assign-package`, { method: 'POST', body: { packageId } }),

  // Members (all orgs)
  getAllMembers: (query) => request('/admin/members', { query }),

  // Bookings (all)
  getAllBookings: (query) => request('/admin/bookings', { query }),

  // Leads (all, no sports)
  getLeads: (query) => request('/admin/leads', { query }),

  // Platform packages
  getPackages: () => request('/admin/packages'),
  createPackage: (data) => request('/admin/packages', { method: 'POST', body: data }),
  updatePackage: (id, data) => request(`/admin/packages/${id}`, { method: 'PATCH', body: data }),
};
