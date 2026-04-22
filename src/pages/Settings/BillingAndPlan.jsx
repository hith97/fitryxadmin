import React from 'react';
import { CheckCircle2, Wallet, Zap } from 'lucide-react';

const PlanCard = ({ name, price, features, current }) => (
  <div className={`rounded-[22px] border-2 p-5 ${current ? 'border-primary bg-primary-light' : 'border-slate-200 bg-white'}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className={`text-base font-bold ${current ? 'text-primary' : 'text-slate-900'}`}>{name}</div>
        <div className={`mt-1 text-2xl font-bold ${current ? 'text-primary' : 'text-slate-800'}`}>
          {price}
        </div>
      </div>
      {current && (
        <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white">
          Current
        </span>
      )}
    </div>
    <div className="mt-4 space-y-2">
      {features.map((f) => (
        <div key={f} className="flex items-center gap-2 text-sm">
          <CheckCircle2 size={14} className={current ? 'text-primary' : 'text-emerald-500'} />
          <span className={current ? 'text-primary/80' : 'text-slate-600'}>{f}</span>
        </div>
      ))}
    </div>
  </div>
);

const BillingAndPlan = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-slate-900">Billing & Plan</h2>
      <p className="mt-1 text-sm text-slate-500">Manage your Fitryx subscription and billing information.</p>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      <PlanCard
        name="Starter"
        price="Free"
        features={['Up to 50 members', 'Basic reports', '1 staff login', 'Email support']}
        current
      />
      <PlanCard
        name="Growth"
        price="₹999/mo"
        features={['Up to 300 members', 'Advanced reports', '5 staff logins', 'WhatsApp notifications']}
      />
      <PlanCard
        name="Pro"
        price="₹2499/mo"
        features={['Unlimited members', 'Full analytics', 'Unlimited staff', 'Priority support', 'Custom branding']}
      />
    </div>

    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <Wallet size={18} />
        </div>
        <div>
          <div className="font-semibold text-slate-900">Billing History</div>
          <div className="text-xs text-slate-400">Invoices and payment records</div>
        </div>
      </div>
      <div className="rounded-2xl bg-slate-50 py-8 text-center text-sm text-slate-400">
        No billing records yet — you're on the free plan.
      </div>
    </div>

    <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-1">
        <Zap size={15} /> Paid plans launching soon
      </div>
      <div className="text-sm text-amber-600">
        Paid subscriptions will be available shortly. Your current usage is free during the beta period.
      </div>
    </div>
  </div>
);

export default BillingAndPlan;
