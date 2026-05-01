import { useAuth } from '../context/AuthContext';

export const PERMISSION_KEYS = {
  canCreateBranch: 'Can create new branches',
  canAssignBranchManager: 'Can assign Branch Manager role',
  canManagePackages: 'Manage packages & plans',
  canManageMembers: 'Manage members & subscriptions',
  canViewReports: 'View reports',
  canViewBilling: 'View billing & expenses',
};

const DEFAULT_PERMISSIONS = {
  PARTNER: {
    canCreateBranch: true,
    canAssignBranchManager: true,
    canManagePackages: true,
    canManageMembers: true,
    canViewReports: true,
    canViewBilling: true,
  },
  BRANCH_MANAGER: {
    canCreateBranch: false,
    canAssignBranchManager: false,
    canManagePackages: true,
    canManageMembers: true,
    canViewReports: true,
    canViewBilling: false,
  },
  STAFF: {
    canCreateBranch: false,
    canAssignBranchManager: false,
    canManagePackages: false,
    canManageMembers: true,
    canViewReports: false,
    canViewBilling: false,
  },
};

const STORAGE_KEY = 'fitryx-role-permissions';

export function getStoredRolePermissions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PERMISSIONS;
    const parsed = JSON.parse(stored);
    // Merge with defaults so new keys are always present
    return {
      PARTNER: { ...DEFAULT_PERMISSIONS.PARTNER, ...parsed.PARTNER },
      BRANCH_MANAGER: { ...DEFAULT_PERMISSIONS.BRANCH_MANAGER, ...parsed.BRANCH_MANAGER },
      STAFF: { ...DEFAULT_PERMISSIONS.STAFF, ...parsed.STAFF },
    };
  } catch {
    return DEFAULT_PERMISSIONS;
  }
}

export function saveRolePermissions(perms) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(perms));
}

export function usePermissions() {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'STAFF';
  // PARTNER / SUPER_ADMIN always get full permissions
  if (role === 'PARTNER' || role === 'SUPER_ADMIN') return DEFAULT_PERMISSIONS.PARTNER;
  const all = getStoredRolePermissions();
  return all[role] || DEFAULT_PERMISSIONS.STAFF;
}
