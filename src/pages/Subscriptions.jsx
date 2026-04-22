import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MoreHorizontal,
  Pause,
  Phone,
  Plus,
  RefreshCw,
  Search,
  X,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';
import { subscriptionApi, memberApi, planApi } from '../services/planApi';

// ── Constants ──────────────────────────────────────────────────
const STATUS_CFG = {
  ACTIVE:    { label: 'Active',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  EXPIRED:   { label: 'Expired',   cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-rose-50 text-rose-600 border-rose-200' },
  PAUSED:    { label: 'Paused',    cls: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const PAYMENT_METHODS = ['cash', 'upi', 'card', 'bank_transfer', 'other'];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.EXPIRED;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

// ── Form helpers ───────────────────────────────────────────────
const inputCls = (err) =>
  `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
    err ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50 focus:border-primary focus:bg-white'
  }`;

const FormField = ({ label, required, error, children }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}{required && <span className="ml-1 text-rose-500">*</span>}
    </label>
    {children}
    {error && <div className="mt-1.5 text-xs text-rose-600">{error}</div>}
  </div>
);

// ── Add Subscription Modal ─────────────────────────────────────
const EMPTY_FORM = {
  memberId: '', planId: '',
  startDate: new Date().toISOString().split('T')[0],
  amountPaid: '', discountAmount: '', paymentMethod: 'cash',
};

const AddSubscriptionModal = ({ isOpen, onClose, onSaved }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [memberSearch, setMemberSearch] = useState('');

  const { data: membersData } = useQuery({
    queryKey: ['members-search', memberSearch],
    queryFn: () => memberApi.list({ search: memberSearch || undefined, limit: 20 }),
    enabled: isOpen,
  });
  const { data: plansData = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: planApi.list,
    enabled: isOpen,
  });

  const members = membersData?.data ?? [];
  const activePlans = Array.isArray(plansData) ? plansData.filter((p) => p.isActive) : [];
  const selectedPlan = activePlans.find((p) => p.id === form.planId);

  React.useEffect(() => {
    if (isOpen) { setForm(EMPTY_FORM); setErrors({}); setMemberSearch(''); }
  }, [isOpen]);

  const set = (f, v) => {
    setForm((prev) => ({ ...prev, [f]: v }));
    setErrors((e) => ({ ...e, [f]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.memberId) e.memberId = 'Select a member.';
    if (!form.planId) e.planId = 'Select a plan.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (payload) => subscriptionApi.create(payload),
    onSuccess: () => {
      toast.success('Subscription created.');
      onSaved?.();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      memberId: form.memberId,
      planId: form.planId,
      startDate: form.startDate || undefined,
      amountPaid: form.amountPaid !== '' ? Number(form.amountPaid) : undefined,
      discountAmount: form.discountAmount !== '' ? Number(form.discountAmount) : undefined,
      paymentMethod: form.paymentMethod || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Subscription"
      width="620px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            <CheckCircle2 size={15} />
            {mutation.isPending ? 'Saving...' : 'Create Subscription'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Member search */}
        <FormField label="Member" required error={errors.memberId}>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search member by name or phone..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>
            {members.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { set('memberId', m.id); setMemberSearch(m.fullName); }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-slate-50 ${
                      form.memberId === m.id ? 'bg-primary-light text-primary' : 'text-slate-700'
                    }`}
                  >
                    <Avatar name={m.fullName} size="xs" />
                    <div>
                      <div className="font-semibold">{m.fullName}</div>
                      <div className="text-[11px] text-slate-400">{m.phone}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </FormField>

        {/* Plan */}
        <FormField label="Plan" required error={errors.planId}>
          <select value={form.planId} onChange={(e) => set('planId', e.target.value)} className={inputCls(errors.planId)}>
            <option value="">Select a plan</option>
            {activePlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ₹{p.price} / {p.duration}d
              </option>
            ))}
          </select>
        </FormField>

        {selectedPlan && (
          <div className="rounded-2xl bg-primary-light px-4 py-3 text-xs text-primary font-medium">
            Duration: {selectedPlan.duration} days &nbsp;·&nbsp; Price: ₹{selectedPlan.price}
            {selectedPlan.discountPrice ? ` (Offer: ₹${selectedPlan.discountPrice})` : ''}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Start Date">
            <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)}
              className={inputCls(false)} />
          </FormField>

          <FormField label="Payment Method">
            <select value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}
              className={inputCls(false)}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1).replace('_', ' ')}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Amount Paid (₹)">
            <input type="number" min="0" value={form.amountPaid}
              onChange={(e) => set('amountPaid', e.target.value)}
              placeholder={selectedPlan ? `e.g. ${selectedPlan.price}` : 'e.g. 2000'}
              className={inputCls(false)} />
          </FormField>

          <FormField label="Discount (₹)">
            <input type="number" min="0" value={form.discountAmount}
              onChange={(e) => set('discountAmount', e.target.value)}
              placeholder="e.g. 0" className={inputCls(false)} />
          </FormField>
        </div>
      </div>
    </Modal>
  );
};

// ── Renew Modal ────────────────────────────────────────────────
const RenewModal = ({ isOpen, onClose, subscription, onSaved }) => {
  const [form, setForm] = useState({ planId: '', amountPaid: '', discountAmount: '', paymentMethod: 'cash' });

  const { data: plansData = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: planApi.list,
    enabled: isOpen,
  });
  const activePlans = Array.isArray(plansData) ? plansData.filter((p) => p.isActive) : [];

  React.useEffect(() => {
    if (isOpen && subscription) {
      setForm({ planId: subscription.planId, amountPaid: '', discountAmount: '', paymentMethod: 'cash' });
    }
  }, [isOpen, subscription]);

  const set = (f, v) => setForm((prev) => ({ ...prev, [f]: v }));

  const mutation = useMutation({
    mutationFn: (payload) => subscriptionApi.renew(subscription.id, payload),
    onSuccess: () => {
      toast.success('Subscription renewed.');
      onSaved?.();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Renew — ${subscription?.member?.fullName ?? ''}`}
      width="520px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
            <RefreshCw size={15} />
            {mutation.isPending ? 'Renewing...' : 'Renew'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Plan" className="md:col-span-2">
          <select value={form.planId} onChange={(e) => set('planId', e.target.value)} className={inputCls(false)}>
            {activePlans.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — ₹{p.price} / {p.duration}d</option>
            ))}
          </select>
        </FormField>
        <FormField label="Amount Paid (₹)">
          <input type="number" min="0" value={form.amountPaid}
            onChange={(e) => set('amountPaid', e.target.value)} placeholder="e.g. 2000" className={inputCls(false)} />
        </FormField>
        <FormField label="Discount (₹)">
          <input type="number" min="0" value={form.discountAmount}
            onChange={(e) => set('discountAmount', e.target.value)} placeholder="e.g. 0" className={inputCls(false)} />
        </FormField>
        <FormField label="Payment Method">
          <select value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)} className={inputCls(false)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1).replace('_', ' ')}</option>
            ))}
          </select>
        </FormField>
      </div>
    </Modal>
  );
};

// ── Row action menu ────────────────────────────────────────────
const RowMenu = ({ sub, onRenew, onCancel, onPause }) => {
  const [open, setOpen] = useState(false);
  const canAct = sub.status === 'ACTIVE' || sub.status === 'PAUSED';

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setOpen((o) => !o)}
        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-30 w-44 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl"
          onMouseLeave={() => setOpen(false)}>
          <button onClick={() => { setOpen(false); onRenew(sub); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <RefreshCw size={13} /> Renew
          </button>
          {canAct && sub.status === 'ACTIVE' && (
            <button onClick={() => { setOpen(false); onPause(sub); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50">
              <Pause size={13} /> Pause
            </button>
          )}
          {canAct && (
            <button onClick={() => { setOpen(false); onCancel(sub); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
              <X size={13} /> Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Tab config ─────────────────────────────────────────────────
const TABS = [
  { key: 'ALL',       label: 'All' },
  { key: 'ACTIVE',    label: 'Active' },
  { key: 'EXPIRED',   label: 'Expired' },
  { key: 'PAUSED',    label: 'Paused' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

// ── Main page ──────────────────────────────────────────────────
const Subscriptions = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [renewSub, setRenewSub] = useState(null);

  const queryStatus = activeTab === 'ALL' ? undefined : activeTab;

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions', { status: queryStatus, page }],
    queryFn: () => subscriptionApi.list({ status: queryStatus, page, limit: 20 }),
    keepPreviousData: true,
  });

  const subs = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, totalPages: 1 };

  const filtered = search
    ? subs.filter((s) =>
        `${s.member?.fullName} ${s.member?.phone} ${s.plan?.name}`
          .toLowerCase().includes(search.toLowerCase())
      )
    : subs;

  const cancelMutation = useMutation({
    mutationFn: (id) => subscriptionApi.cancel(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subscriptions'] }); toast.success('Subscription cancelled.'); },
    onError: (err) => toast.error(err.message),
  });

  const pauseMutation = useMutation({
    mutationFn: (id) => subscriptionApi.pause(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subscriptions'] }); toast.success('Subscription paused.'); },
    onError: (err) => toast.error(err.message),
  });

  const handleCancel = (sub) => {
    if (window.confirm(`Cancel subscription for "${sub.member?.fullName}"?`)) {
      cancelMutation.mutate(sub.id);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12 space-y-8">
      <AddSubscriptionModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['subscriptions'] })}
      />
      <RenewModal
        isOpen={Boolean(renewSub)}
        subscription={renewSub}
        onClose={() => setRenewSub(null)}
        onSaved={() => { queryClient.invalidateQueries({ queryKey: ['subscriptions'] }); setRenewSub(null); }}
      />

      {/* Header */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Subscriptions
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">Subscriptions</h1>
          <p className="mt-2 text-sm text-slate-500">
            Track active plans, renewals, and payment history.
          </p>
        </div>
        <Button className="h-12 rounded-2xl px-5" onClick={() => setAddOpen(true)}>
          <Plus size={18} /> New Subscription
        </Button>
      </div>

      {/* Tab stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`card p-5 border text-left transition-all ${
              activeTab === tab.key ? 'border-primary bg-primary-light' : 'border-slate-200 hover:border-primary/30'
            }`}>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{tab.label}</div>
            <div className={`mt-2 text-3xl font-bold ${activeTab === tab.key ? 'text-primary' : 'text-slate-900'}`}>
              {tab.key === 'ALL' ? meta.total : '—'}
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card p-4 border-slate-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member name, phone or plan..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white" />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading subscriptions...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center text-center border-slate-200">
          <Users size={40} className="text-slate-200 mb-4" />
          <div className="text-lg font-semibold text-slate-700">No subscriptions found</div>
          <div className="mt-2 text-sm text-slate-400 mb-6">Create a subscription to get started.</div>
          <Button onClick={() => setAddOpen(true)}><Plus size={16} /> New Subscription</Button>
        </div>
      ) : (
        <div className="card border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {['Member', 'Plan', 'Start', 'Expires', 'Amount Paid', 'Method', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="transition-colors hover:bg-slate-50/70">
                    {/* Member */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={sub.member?.fullName} size="sm" />
                        <div>
                          <div className="font-semibold text-slate-900">{sub.member?.fullName}</div>
                          {sub.member?.phone && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Phone size={10} /> {sub.member.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-[13px] text-primary">{sub.plan?.name}</div>
                      {sub.plan?.duration && (
                        <div className="text-[11px] text-slate-400">{sub.plan.duration}d plan</div>
                      )}
                    </td>

                    {/* Start */}
                    <td className="px-5 py-4 text-[12px] text-slate-500">
                      {sub.startDate ? format(new Date(sub.startDate), 'dd MMM yyyy') : '—'}
                    </td>

                    {/* Expires */}
                    <td className="px-5 py-4">
                      <div className={`text-[12px] font-medium ${
                        sub.status === 'ACTIVE' && new Date(sub.endDate) < new Date(Date.now() + 7 * 86400000)
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}>
                        {sub.endDate ? format(new Date(sub.endDate), 'dd MMM yyyy') : '—'}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4">
                      {sub.amountPaid != null ? (
                        <div>
                          <div className="text-[13px] font-semibold text-slate-800">
                            ₹{sub.amountPaid.toLocaleString()}
                          </div>
                          {sub.discountAmount > 0 && (
                            <div className="text-[11px] text-emerald-600">
                              −₹{sub.discountAmount.toLocaleString()} off
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[12px] text-slate-300">—</span>
                      )}
                    </td>

                    {/* Payment method */}
                    <td className="px-5 py-4">
                      <span className="text-[12px] capitalize text-slate-500">
                        {sub.paymentMethod?.replace('_', ' ') ?? '—'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={sub.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <RowMenu
                        sub={sub}
                        onRenew={setRenewSub}
                        onCancel={handleCancel}
                        onPause={(s) => pauseMutation.mutate(s.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-sm text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{filtered.length}</strong> of{' '}
              <strong className="text-slate-800">{meta.total}</strong> subscriptions
            </span>
            {meta.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                  className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-white">
                  Prev
                </button>
                <span className="text-xs font-semibold">{page} / {meta.totalPages}</span>
                <button disabled={page === meta.totalPages} onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-white">
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
