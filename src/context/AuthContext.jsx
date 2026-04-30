/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from '../config/auth';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);

const normalizeApiUser = (payload) => {
  const user = payload.user || {};
  const partner = payload.partner || null;
  const displayName = user.name || user.fullName || user.email?.split('@')[0] || user.phone || 'User';

  // Partner owner: branches come from partner.branches in login response
  const branches = partner?.branches ?? payload.branches ?? [];

  if (user.role === 'BRANCH_MANAGER') {
    return {
      id: user.id,
      fullName: displayName,
      email: user.email || '',
      phone: user.phone || '',
      role: 'BRANCH_MANAGER',
      approvalStatus: 'approved',
      branches,
      business: branches[0]
        ? { id: branches[0].id, name: branches[0].name, status: 'VERIFIED' }
        : null,
    };
  }

  return {
    id: user.id,
    fullName: displayName,
    email: user.email,
    phone: user.phone || '',
    role: user.role || 'USER',
    approvalStatus: partner?.status === 'VERIFIED' ? 'approved' : 'pending',
    branches,
    business: partner
      ? {
          id: partner.id,
          name: partner.businessName || partner.name || 'Partner Business',
          categoryId: partner.categoryId || null,
          status: partner.status,
        }
      : null,
    partner: partner || null,
    rawUser: user,
  };
};

const readStoredCurrentUser = () => {
  try {
    const stored = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => readStoredCurrentUser());

  const login = async ({ email, password }) => {
    try {
      const payload = await authApi.login({ email: email.trim(), password });
      const token = payload.access_token || payload.accessToken || payload.token;

      if (!token) {
        throw new Error('Login succeeded but no access token was returned.');
      }

      const nextUser = normalizeApiUser(payload);
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(nextUser));
      setCurrentUser(nextUser);

      return { ok: true, token, user: nextUser, partner: payload.partner || null, payload };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    localStorage.removeItem('fitryx-selected-branch-id');
    setCurrentUser(null);
  };

  const updateCurrentUser = (updates) => {
    if (!currentUser) return;
    const nextUser = {
      ...currentUser,
      ...updates,
      business: updates.business
        ? { ...currentUser.business, ...updates.business }
        : currentUser.business,
    };
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(nextUser));
    setCurrentUser(nextUser);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        ready: true,
        login,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
