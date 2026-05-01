import { API_BASE_URL } from '../config/api';

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data?.message || data?.error;
    throw new Error(message || 'Invalid email or password.');
  }

  return data;
};

const post = (url, body, token) =>
  fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  }).then(parseResponse);

export const authApi = {
  login: (payload) => post('/auth/login', payload),
  sendEmailLoginOtp: (email) => post('/auth/email-otp/send', { email }),
  verifyEmailLoginOtp: (email, code) => post('/auth/email-otp/verify', { email, code }),
  setPassword: (token, password) => post('/auth/set-password', { password }, token),
  acceptInvite: (email, token, password) => post('/auth/accept-invite', { email, token, password }),
};

