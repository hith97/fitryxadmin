import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dumbbell, UserPlus, X, Users, ChevronDown, Search, ArrowRight, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { planApi, subscriptionApi, staffApi, memberApi } from '../services/planApi';

// ── Helpers ──────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:bg-white transition';

const isPTplan = (p) =>
  p.isPT === true || p.membershipCategory?.name?.toLowerCase().includes('personal training');

const Avatar = ({ name, photo, size = 8 }) => {
  const initials = name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  if (photo) return <img src={photo} alt={name} className={`w-${size} h-${size} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`w-${size} h-${size} rounded-full bg-primary/10 flex items-center justify-center shrink-0`}>
      <span className="text-xs font-bold text-primary">{initials}</span>
    </div>
  );
};

const PAYMENT_METHODS = ['cash', 'upi', 'card', 'bank_transfer', 'other'];
const PAYMENT_STATUSES = [
  { value: 'PAID',    label: 'Fully Paid' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'PENDING', label: 'Pending' },
];

// ── Enroll Member Modal ──────────────────────────────────────────
const EnrollModal = ({ ptPlans, trainers, onClose }) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    memberId: '', planId: '', trainerId: '', amountPaid: '', startDate: '',
    paymentMethod: 'cash', discountAmount: '', paymentStatus: 'PAID',
    remainingAmount: '', nextPaymentDate: '',
  });
  const [memberQuery, setMemberQuery] = useState('');
  const [memberResults, setMemberResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchTimeout = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const searchMembers = (q) => {
    setMemberQuery(q);
    clearTimeout(searchTimeout.current);
    if (!q.trim()) { setMemberResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await memberApi.list({ search: q, limit: 8 });
        setMemberResults(res.data || res || []);
      } catch { setMemberResults([]); }
      setSearching(false);
    }, 350);
  };

  const selectedPlan = ptPlans.find((p) => p.id === form.planId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.memberId || !form.planId) { toast.error('Member and PT package are required.'); return; }
    setSaving(true);
    try {
      await subscriptionApi.create({
        memberId: form.memberId,
        planId: form.planId,
        trainerId: form.trainerId || undefined,
        amountPaid: form.amountPaid ? Number(form.amountPaid) : undefined,
        discountAmount: form.discountAmount ? Number(form.discountAmount) : undefined,
        paymentMethod: form.paymentMethod || undefined,
        paymentStatus: form.paymentStatus,
        remainingAmount: form.remainingAmount ? Number(form.remainingAmount) : undefined,
        nextPaymentDate: form.nextPaymentDate || undefined,
        startDate: form.startDate || undefined,
      });
      toast.success('Member enrolled in PT.');
      qc.invalidateQueries({ queryKey: ['pt-enrollments'] });
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Enroll Member in PT</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        {ptPlans.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <Dumbbell className="mx-auto text-gray-200" size={36} />
            <p className="text-sm font-semibold text-gray-700">No PT packages found</p>
            <p className="text-xs text-gray-400">Create a membership plan with the <strong>Personal Training</strong> category first.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Member search */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Member *</label>
              {selectedMember ? (
                <div className="flex items-center gap-2 rounded-xl border border-primary bg-primary/5 px-3 py-2">
                  <Avatar name={selectedMember.fullName} size={7} />
                  <span className="text-sm font-medium flex-1">{selectedMember.fullName}</span>
                  <button type="button" onClick={() => { setSelectedMember(null); set('memberId', ''); setMemberQuery(''); }} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={memberQuery} onChange={(e) => searchMembers(e.target.value)} placeholder="Search by name, phone or ID..." className={`${inputCls} pl-8`} />
                  </div>
                  {(memberResults.length > 0 || searching) && (
                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {searching && <div className="px-4 py-2 text-xs text-gray-400">Searching…</div>}
                      {memberResults.map((m) => (
                        <button key={m.id} type="button"
                          onClick={() => { setSelectedMember(m); set('memberId', m.id); setMemberResults([]); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left">
                          <Avatar name={m.fullName} photo={m.photoUrl} size={7} />
                          <div><div className="text-sm font-medium">{m.fullName}</div><div className="text-xs text-gray-400">{m.phone}</div></div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* PT Package select */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">PT Package *</label>
              <select value={form.planId} onChange={(e) => set('planId', e.target.value)} className={inputCls} required>
                <option value="">Select package</option>
                {ptPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {fmt(p.price)}{p.sessions ? ` · ${p.sessions} sessions` : ''} · {p.duration}d
                  </option>
                ))}
              </select>
              {selectedPlan && (
                <p className="mt-1 text-xs text-gray-400">
                  {selectedPlan.membershipCategory?.name} · {selectedPlan.duration} days
                  {selectedPlan.sessions ? ` · ${selectedPlan.sessions} sessions` : ''}
                </p>
              )}
            </div>

            {/* Trainer */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Assign Trainer</label>
              <select value={form.trainerId} onChange={(e) => set('trainerId', e.target.value)} className={inputCls}>
                <option value="">No trainer assigned</option>
                {trainers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {s.role}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Amount Paid (₹)</label>
                <input type="number" value={form.amountPaid} onChange={(e) => set('amountPaid', e.target.value)}
                  placeholder={selectedPlan ? String(selectedPlan.price) : 'Auto from plan'} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Discount (₹)</label>
                <input type="number" value={form.discountAmount} onChange={(e) => set('discountAmount', e.target.value)}
                  placeholder="e.g. 0" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Mode</label>
                <select value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)} className={inputCls}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1).replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Payment status */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Status</label>
              <div className="flex gap-2">
                {PAYMENT_STATUSES.map((ps) => (
                  <button key={ps.value} type="button" onClick={() => set('paymentStatus', ps.value)}
                    className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all ${
                      form.paymentStatus === ps.value
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-primary/40'
                    }`}>
                    {ps.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Partial / pending extra fields */}
            {form.paymentStatus !== 'PAID' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
                <div className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                  <Calendar size={12} /> Installment Details
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Remaining Amount (₹)</label>
                    <input type="number" value={form.remainingAmount} onChange={(e) => set('remainingAmount', e.target.value)}
                      placeholder="e.g. 1000" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Next Payment Date</label>
                    <input type="date" value={form.nextPaymentDate} onChange={(e) => set('nextPaymentDate', e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60">
                {saving ? 'Enrolling…' : 'Enroll Member'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Trainer Assign Dropdown ──────────────────────────────────────
const TrainerDropdown = ({ subId, currentTrainerId, trainers }) => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const buttonRef = useRef(null);

  const assign = async (trainerId) => {
    setOpen(false);
    try {
      await subscriptionApi.updateTrainer(subId, trainerId || null);
      qc.invalidateQueries({ queryKey: ['pt-enrollments'] });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const current = trainers.find((t) => t.id === currentTrainerId);

  useEffect(() => {
    if (!open) return;

    const positionMenu = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const width = 224;
      const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
      const top = Math.min(rect.bottom + 6, window.innerHeight - 260);
      setMenuStyle({ left, top, width });
    };

    positionMenu();
    window.addEventListener('resize', positionMenu);
    window.addEventListener('scroll', positionMenu, true);

    return () => {
      window.removeEventListener('resize', positionMenu);
      window.removeEventListener('scroll', positionMenu, true);
    };
  }, [open]);

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-w-[140px] items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-primary/40 hover:bg-slate-50"
      >
        {current ? current.name : 'Assign trainer'}
        <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
            style={menuStyle}
          >
            <button onClick={() => assign(null)} className="w-full px-3 py-2 text-left text-xs font-medium text-slate-500 hover:bg-slate-50">No trainer</button>
            {trainers.length === 0 && (
              <div className="px-3 py-2 text-xs text-slate-400">No active trainers found</div>
            )}
            {trainers.map((t) => (
              <button key={t.id} onClick={() => assign(t.id)}
                className={`w-full px-3 py-2 text-left text-xs hover:bg-primary/5 ${t.id === currentTrainerId ? 'font-semibold text-primary' : 'text-slate-700'}`}>
                <span className="block truncate">{t.name}</span>
                {t.role && <span className="block truncate text-[11px] font-normal text-slate-400">{t.role}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────
export default function PTCollections() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [showEnroll, setShowEnroll] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch all plans then filter to PT ones client-side
  const { data: allPlans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: planApi.list,
  });
  const ptPlans = allPlans.filter(isPTplan).filter((p) => p.isActive);

  const { data: enrollments = [], isLoading: enrollLoading } = useQuery({
    queryKey: ['pt-enrollments'],
    queryFn: subscriptionApi.listPT,
  });

  const { data: allStaff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: staffApi.list,
  });
  const trainers = allStaff.filter((s) => s.isActive);

  const cancelEnrollment = useMutation({
    mutationFn: (id) => subscriptionApi.cancel(id),
    onSuccess: () => { toast.success('Enrollment cancelled.'); qc.invalidateQueries({ queryKey: ['pt-enrollments'] }); },
    onError: (err) => toast.error(err.message),
  });

  const filteredEnrollments = enrollments.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.member?.fullName?.toLowerCase().includes(q) ||
      e.trainer?.name?.toLowerCase().includes(q) ||
      e.plan?.name?.toLowerCase().includes(q)
    );
  });

  const statusColor = {
    ACTIVE: 'bg-emerald-50 text-emerald-700',
    PAUSED: 'bg-yellow-50 text-yellow-700',
    CANCELLED: 'bg-red-50 text-red-600',
    EXPIRED: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Dumbbell size={22} className="text-primary" /> PT Collections
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Members enrolled in Personal Training plans
          </p>
        </div>
        <div className="flex items-center gap-2">
          {ptPlans.length === 0 && (
            <button onClick={() => navigate('/plans')}
              className="flex items-center gap-2 rounded-xl border border-dashed border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5">
              <ArrowRight size={15} /> Create PT Package from Plans
            </button>
          )}
          <button onClick={() => setShowEnroll(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
            <UserPlus size={15} /> Enroll Member
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active PT Members', value: enrollments.filter((e) => e.status === 'ACTIVE').length, color: 'text-emerald-600' },
          { label: 'PT Packages', value: ptPlans.length, color: 'text-primary' },
          { label: 'Trainers', value: trainers.length, color: 'text-blue-600' },
          { label: 'Total Enrolled', value: enrollments.length, color: 'text-gray-700' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by member, trainer or package…"
          className="w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" />
      </div>

      {/* Members table */}
      {enrollLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">Loading…</div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <Users className="mx-auto mb-3 text-gray-200" size={40} />
          <p className="font-semibold text-gray-600">{search ? 'No results found' : 'No PT enrollments yet'}</p>
          {!search && (
            <p className="text-sm text-gray-400 mt-1">
              {ptPlans.length === 0
                ? 'First create a membership plan with the "Personal Training" category.'
                : 'Click "Enroll Member" to assign a member to a PT package.'}
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] table-fixed text-sm">
              <colgroup>
              <col className="w-[22%]" />
              <col className="w-[22%]" />
              <col className="w-[18%]" />
              <col className="w-[16%]" />
              <col className="w-[10%]" />
              <col className="w-[9%]" />
              <col className="w-[3%]" />
              </colgroup>
              <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Member</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">PT Package</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Assignee</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Period</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Sessions</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-4 py-3.5" />
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {filteredEnrollments.map((e) => {
                const start = e.startDate
                  ? new Date(e.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
                  : '-';
                const end = e.endDate
                  ? new Date(e.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
                  : '-';
                return (
                  <tr key={e.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4 align-middle">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={e.member?.fullName} photo={e.member?.photoUrl} size={9} />
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900">{e.member?.fullName || 'Unknown member'}</div>
                          <div className="truncate text-xs text-slate-400">{e.member?.phone || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="truncate font-semibold text-slate-900">{e.plan?.name || '-'}</div>
                      {e.amountPaid != null && <div className="mt-0.5 text-xs text-slate-400">{fmt(e.amountPaid)}</div>}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <TrainerDropdown subId={e.id} currentTrainerId={e.trainerId} trainers={trainers} />
                    </td>
                    <td className="px-5 py-4 align-middle text-xs font-medium text-slate-500">{start} - {end}</td>
                    <td className="px-5 py-4 align-middle text-xs font-semibold text-slate-600">
                      {e.plan?.sessions ? `${e.sessionsUsed ?? 0} / ${e.plan.sessions}` : '-'}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusColor[e.status] || statusColor.EXPIRED}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle text-right">
                      <button onClick={() => { if (confirm('Cancel this PT enrollment?')) cancelEnrollment.mutate(e.id); }}
                        className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                        aria-label="Cancel PT enrollment">
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-sm text-slate-500">
            Showing <strong className="text-slate-800">{filteredEnrollments.length}</strong> PT enrollment{filteredEnrollments.length === 1 ? '' : 's'}
          </div>
        </div>
      )}

      {showEnroll && (
        <EnrollModal ptPlans={ptPlans} trainers={trainers} onClose={() => setShowEnroll(false)} />
      )}
    </div>
  );
}
