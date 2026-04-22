import React from 'react';
import { MessageCircle, CheckCircle2, Send } from 'lucide-react';

const Feature = ({ label }) => (
  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
    <span className="text-sm text-slate-700">{label}</span>
  </div>
);

const WhatsApp = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-slate-900">WhatsApp Integration</h2>
      <p className="mt-1 text-sm text-slate-500">
        Send automated messages to members via WhatsApp Business API.
      </p>
    </div>

    <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <MessageCircle size={26} />
      </div>
      <div className="mt-5 text-lg font-semibold text-slate-800">WhatsApp coming soon</div>
      <div className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
        Connect your WhatsApp Business account to send reminders and receipts automatically.
      </div>
    </div>

    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Send size={15} className="text-primary" />
        <h3 className="font-semibold text-slate-900">Planned automations</h3>
      </div>
      <div className="space-y-2">
        {[
          'Membership expiry reminder (3 days before)',
          'Payment receipt after subscription creation',
          'Welcome message on new member registration',
          'Follow-up message for leads',
          'Attendance confirmation',
        ].map((f) => <Feature key={f} label={f} />)}
      </div>
    </div>
  </div>
);

export default WhatsApp;
