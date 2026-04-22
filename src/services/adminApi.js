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

const request = async (endpoint, { method = 'GET', query } = {}) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return parseResponse(response);
};

export const adminApi = {
  getPartners: (query) => request('/admin/partners', { query }),
  getPartnerById: (id) => request(`/admin/partners/${id}`),
  approvePartner: (id) => request(`/admin/partners/${id}/approve`, { method: 'PATCH' }),
  rejectPartner: (id) => request(`/admin/partners/${id}/reject`, { method: 'PATCH' }),
  suspendPartner: (id) => request(`/admin/partners/${id}/suspend`, { method: 'PATCH' }),
};

