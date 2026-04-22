import React, { useState } from 'react';
import { Bell } from 'lucide-react';

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-primary' : 'bg-slate-200'
    }`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
      checked ? 'translate-x-6' : 'translate-x-1'
    }`} />
  </button>
);

const PREFS = [
  { key: 'membership_expiry',  label: 'Membership expiry reminders',    desc: 'Notify 3 days before a subscription expires' },
  { key: 'new_member',         label: 'New member registration',         desc: 'Alert when a new member is added' },
  { key: 'payment_received',   label: 'Payment received',                desc: 'Confirm every payment on a subscription' },
  { key: 'lead_followup',      label: 'Lead follow-up due',              desc: 'Remind when a follow-up date is reached' },
  { key: 'attendance',         label: 'Daily attendance summary',        desc: 'End-of-day attendance digest' },
];

const NotificationsSettings = () => {
  const [prefs, setPrefs] = useState(() =>
    Object.fromEntries(PREFS.map((p) => [p.key, p.key !== 'attendance']))
  );

  const toggle = (key, val) => setPrefs((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
        <p className="mt-1 text-sm text-slate-500">Choose which alerts you receive inside the app.</p>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <Bell size={18} />
          </div>
          <div className="font-semibold text-slate-900">In-App Notifications</div>
        </div>

        <div className="space-y-4">
          {PREFS.map((pref) => (
            <div key={pref.key} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-800">{pref.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{pref.desc}</div>
              </div>
              <Toggle checked={prefs[pref.key]} onChange={(v) => toggle(pref.key, v)} />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {}}
            className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>

      <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <div className="font-semibold text-slate-600">Email & WhatsApp notifications coming soon</div>
        <div className="mt-1 text-sm text-slate-400">
          You'll be able to route alerts to email and WhatsApp once those integrations are live.
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettings;
