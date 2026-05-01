import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  PERMISSION_KEYS,
  getStoredRolePermissions,
  saveRolePermissions,
} from '../../hooks/usePermissions';

const CONFIGURABLE_ROLES = [
  { key: 'BRANCH_MANAGER', label: 'Branch Manager', color: 'text-blue-700 bg-blue-50' },
  { key: 'STAFF', label: 'Staff', color: 'text-gray-700 bg-gray-100' },
];

export default function RolePermissions() {
  const [perms, setPerms] = useState(() => getStoredRolePermissions());

  const toggle = (role, key) => {
    setPerms((prev) => ({
      ...prev,
      [role]: { ...prev[role], [key]: !prev[role][key] },
    }));
  };

  const handleSave = () => {
    saveRolePermissions(perms);
    toast.success('Role permissions saved.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Role Permissions</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Control what Branch Managers and Staff can do in your dashboard.
        </p>
      </div>

      <div className="space-y-4">
        {CONFIGURABLE_ROLES.map((roleInfo) => (
          <div key={roleInfo.key} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
              <Shield size={16} className="text-gray-500" />
              <span className="font-semibold text-gray-900">{roleInfo.label}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleInfo.color}`}>
                {roleInfo.key}
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {Object.entries(PERMISSION_KEYS).map(([key, label]) => {
                const enabled = perms[roleInfo.key]?.[key] ?? false;
                return (
                  <div key={key} className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-sm text-gray-700">{label}</span>
                    <button
                      type="button"
                      onClick={() => toggle(roleInfo.key, key)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                        enabled ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
                          enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="btn-primary px-6 py-2.5 font-semibold"
        >
          Save Permissions
        </button>
      </div>
    </div>
  );
}
