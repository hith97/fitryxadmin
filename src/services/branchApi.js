import { API_BASE_URL } from '../config/api';
import { AUTH_TOKEN_STORAGE_KEY } from '../config/auth';

const getHeaders = (branchId = null) => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || ''}`,
  };
  if (branchId) headers['x-branch-id'] = branchId;
  return headers;
};

const handle = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
};

export const branchApi = {
  // List all branches for the authenticated partner
  getBranches: () =>
    fetch(`${API_BASE_URL}/partner/branches`, { headers: getHeaders() }).then(handle),

  // Get single branch details
  getBranch: (id) =>
    fetch(`${API_BASE_URL}/partner/branches/${id}`, { headers: getHeaders() }).then(handle),

  // Create a new branch
  createBranch: (formData) =>
    fetch(`${API_BASE_URL}/partner/branches`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || ''}` },
      body: formData,
    }).then(handle),

  // Update branch details
  updateBranch: (id, data) =>
    fetch(`${API_BASE_URL}/partner/branches/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handle),

  // Deactivate a branch
  deleteBranch: (id) =>
    fetch(`${API_BASE_URL}/partner/branches/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handle),

  // Get QR token for a specific branch
  getBranchQr: (id) =>
    fetch(`${API_BASE_URL}/partner/branches/${id}/qr`, { headers: getHeaders() }).then(handle),

  // Assign manager/staff access to a branch
  assignAccess: (branchId, data) =>
    fetch(`${API_BASE_URL}/partner/branches/${branchId}/access`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handle),

  // List all users with access to a branch
  listAccess: (branchId) =>
    fetch(`${API_BASE_URL}/partner/branches/${branchId}/access`, { headers: getHeaders() }).then(handle),

  // Remove a user's access from a branch
  removeAccess: (branchId, userId) =>
    fetch(`${API_BASE_URL}/partner/branches/${branchId}/access/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handle),

  // For branch managers: list their accessible branches
  getMyBranches: () =>
    fetch(`${API_BASE_URL}/partner/branches/my/access`, { headers: getHeaders() }).then(handle),
};
