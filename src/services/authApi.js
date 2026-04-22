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

export const authApi = {
  login: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return parseResponse(response);
  },
};

