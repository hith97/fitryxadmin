import { API_BASE_URL } from '../config/api';

const buildUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data?.message || data?.error;
    throw new Error(message || 'Something went wrong. Please try again.');
  }

  return data;
};

const request = async (endpoint, { method = 'GET', token, body, formData } = {}) => {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!formData && body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(buildUrl(endpoint), {
    method,
    headers,
    body: formData || (body ? JSON.stringify(body) : undefined),
  });

  return parseResponse(response);
};

export const partnerApi = {
  register: (payload) => request('/partner/register', { method: 'POST', body: payload }),
  verifyPhone: (token, phone, otp) => request('/partner/verify-phone', { method: 'POST', token, body: { phone, code: otp } }),
  verifyEmail: (token, email, otp) => request('/partner/verify-email', { method: 'POST', token, body: { email, code: otp } }),
  resendPhoneOtp: (token) => request('/partner/otp/resend-phone', { method: 'POST', token }),
  resendEmailOtp: (token) => request('/partner/otp/resend-email', { method: 'POST', token }),
  submitOnboarding: (token, payload, files = []) => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value);
    });

    files.forEach((file) => formData.append('images', file));

    return request('/partner/onboarding', { method: 'POST', token, formData });
  },
  getStatus: (token) => request('/partner/status', { token }),
};
