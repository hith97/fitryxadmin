import React, { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, Wallet, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { partnerApi } from '../../services/partnerApi';
import { AUTH_TOKEN_STORAGE_KEY } from '../../config/auth';

const PlanCard = ({ pkg, current }) => (
  <div className={`rounded-[22px] border-2 p-5 flex flex-col gap-4 ${current ? 'border-primary bg-primary-light' : 'border-slate-200 bg-white'}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className={`text-base font-bold ${current ? 'text-primary' : 'text-slate-900'}`}>{pkg.name}</div>
        <div className={`mt-1 text-2xl font-bold ${current ? 'text-primary' : 'text-slate-800'}`}>
          {pkg.price === 0 ? 'Free' : `₹${pkg.price}/mo`}
        </div>
        {pkg.description && (
          <div className={`mt-1 text-sm ${current ? 'text-primary/70' : 'text-slate-500'}`}>{pkg.description}</div>
        )}
      </div>
      {current && (
        <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white">
          Current
        </span>
      )}
    </div>
    <div className="flex items-center gap-2 text-sm">
      <CheckCircle2 size={14} className={current ? 'text-primary' : 'text-emerald-500'} />
      <span className={current ? 'text-primary/80' : 'text-slate-600'}>{pkg.durationDays} days access</span>
    </div>
  </div>
);

const BillingAndPlan = () => {
  const [packages, setPackages] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    try {
      const [pkgs, sub] = await Promise.allSettled([
        partnerApi.getPackages(token),
        partnerApi.getMySubscription(token),
      ]);
      if (pkgs.status === 'fulfilled') setPackages(Array.isArray(pkgs.value) ? pkgs.value : []);
      if (sub.status === 'fulfilled') setSubscription(sub.value);
    } catch {
      toast.error('Failed to load billing info.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const activePackageId = subscription?.packageId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Billing & Plan</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your Fitryx subscription and billing information.</p>
        </div>
        <button onClick={load} disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 h-10 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Current subscription summary */}
      {subscription && (
        <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-1">
            <CheckCircle2 size={15} /> Active Subscription
          </div>
          <div className="text-sm text-emerald-600">
            <span className="font-bold">{subscription.package?.name}</span>
            {' · '}Expires {new Date(subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      )}

      {/* Package cards */}
      {loading ? (
        <div className="rounded-[22px] border border-slate-200 p-8 text-center text-sm text-slate-400">Loading plans…</div>
      ) : packages.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <PlanCard key={pkg.id} pkg={pkg} current={pkg.id === activePackageId} />
          ))}
        </div>
      ) : (
        <div className="rounded-[22px] border border-slate-200 p-8 text-center text-sm text-slate-400">
          No plans available yet.
        </div>
      )}

      {/* Billing history */}
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
};

export default BillingAndPlan;
