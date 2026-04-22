import React, { useState } from 'react';
import { KeyRound, Mail, Phone, ShieldCheck, User2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

const Field = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5">
    {Icon && <Icon size={16} className="text-slate-400 shrink-0" />}
    <div className="flex-1 min-w-0">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-slate-800 truncate">{value || '—'}</div>
    </div>
  </div>
);

const AccountSettings = () => {
  const { currentUser } = useAuth();
  const [section, setSection] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Account Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your login credentials and security preferences.</p>
      </div>

      {/* Current account info */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Account Information</h3>
        <Field label="Full Name" value={currentUser?.fullName} icon={User2} />
        <Field label="Email"     value={currentUser?.email}    icon={Mail} />
        <Field label="Phone"     value={currentUser?.phone}    icon={Phone} />
        <Field label="Role"      value={currentUser?.role}     icon={ShieldCheck} />
      </div>

      {/* Change password */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shrink-0">
              <KeyRound size={18} />
            </div>
            <div>
              <div className="font-semibold text-slate-900">Password</div>
              <div className="text-sm text-slate-400">Last changed: unknown</div>
            </div>
          </div>
          <Button variant="secondary" className="rounded-2xl px-4" onClick={() => setSection('password')}>
            Change
          </Button>
        </div>

        {section === 'password' && (
          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
            {['Current Password', 'New Password', 'Confirm Password'].map((label) => (
              <div key={label}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
                <input
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white"
                />
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" className="rounded-2xl" onClick={() => setSection(null)}>Cancel</Button>
              <Button className="rounded-2xl">Update Password</Button>
            </div>
          </div>
        )}
      </div>

      {/* 2FA - coming soon */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="font-semibold text-slate-900">Two-Factor Authentication</div>
              <div className="text-sm text-slate-400">Add an extra layer of security to your account.</div>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
