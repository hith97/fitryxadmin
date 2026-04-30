/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { branchApi } from '../services/branchApi';
import { useAuth } from './AuthContext';

const BranchContext = createContext(null);

const SELECTED_BRANCH_KEY = 'fitryx-selected-branch-id';

export const BranchProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const isPartner = currentUser?.role === 'PARTNER';
  const isBranchManager = currentUser?.role === 'BRANCH_MANAGER';

  const [branches, setBranches] = useState(currentUser?.branches ?? []);
  const [selectedBranchId, setSelectedBranchId] = useState(
    () => localStorage.getItem(SELECTED_BRANCH_KEY) || null,
  );
  const [loading, setLoading] = useState(false);

  // Derive selected branch object
  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0] || null;

  // Load branches from API when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || (!isPartner && !isBranchManager)) {
      setBranches([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        if (isPartner) {
          const data = await branchApi.getBranches();
          const list = Array.isArray(data) ? data : [];
          setBranches(list);
          // If stored selection no longer valid, reset to first
          if (list.length && !list.find((b) => b.id === selectedBranchId)) {
            const main = list.find((b) => b.isMainBranch) || list[0];
            setSelectedBranchId(main.id);
            localStorage.setItem(SELECTED_BRANCH_KEY, main.id);
          }
        } else {
          // BRANCH_MANAGER: fetch their accessible branches
          const data = await branchApi.getMyBranches();
          const list = Array.isArray(data) ? data.map((a) => ({ ...a.business, role: a.role })) : [];
          setBranches(list);
          if (list.length && !list.find((b) => b.id === selectedBranchId)) {
            setSelectedBranchId(list[0].id);
            localStorage.setItem(SELECTED_BRANCH_KEY, list[0].id);
          }
        }
      } catch {
        // swallow — branches already in state from login payload or empty
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentUser?.id]);

  const switchBranch = (branchId) => {
    setSelectedBranchId(branchId);
    localStorage.setItem(SELECTED_BRANCH_KEY, branchId);
  };

  const refreshBranches = async () => {
    if (!isAuthenticated) return;
    try {
      const data = isPartner
        ? await branchApi.getBranches()
        : await branchApi.getMyBranches().then((d) => d.map((a) => ({ ...a.business, role: a.role })));
      setBranches(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  };

  return (
    <BranchContext.Provider
      value={{
        branches,
        selectedBranch,
        selectedBranchId,
        switchBranch,
        refreshBranches,
        loading,
        isMultiBranch: branches.length > 1,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranch must be used within BranchProvider');
  return ctx;
};
