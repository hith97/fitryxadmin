import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dumbbell, UserPlus, X, Users, ChevronDown, Search, ArrowRight } from 'lucide-react';
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

// ── Enroll Member Modal ──────────────────────────────────────────
const EnrollModal = ({ ptPlans, trainers, onClose }) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({ memberId: '', planId: '', trainerId: '', amountPaid: '', startDate: '' });
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
                    <input value={memberQuery} onChange={(e) => searchMembers(e.target.value)} placeholder="Search member..." className={`${inputCls} pl-8`} />
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
                <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={inputCls} />
              </div>
            </div>

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

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50">
        {current ? current.name : 'Assign trainer'}
        <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <button onClick={() => assign(null)} className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-50">No trainer</button>
            {trainers.map((t) => (
              <button key={t.id} onClick={() => assign(t.id)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-primary/5 ${t.id === currentTrainerId ? 'font-semibold text-primary' : 'text-gray-700'}`}>
                {t.name} <span className="text-gray-400">({t.role})</span>
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
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Member</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">PT Package</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Trainer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Period</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Sessions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEnrollments.map((e) => {
                const start = new Date(e.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                const end = new Date(e.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={e.member?.fullName} photo={e.member?.photoUrl} size={8} />
                        <div>
                          <div className="font-medium text-gray-900">{e.member?.fullName}</div>
                          <div className="text-xs text-gray-400">{e.member?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{e.plan?.name}</div>
                      {e.amountPaid && <div className="text-xs text-gray-400">{fmt(e.amountPaid)}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <TrainerDropdown subId={e.id} currentTrainerId={e.trainerId} trainers={trainers} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{start} – {end}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {e.plan?.sessions ? `${e.sessionsUsed ?? 0} / ${e.plan.sessions}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[e.status] || statusColor.EXPIRED}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { if (confirm('Cancel this PT enrollment?')) cancelEnrollment.mutate(e.id); }}
                        className="text-gray-300 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showEnroll && (
        <EnrollModal ptPlans={ptPlans} trainers={trainers} onClose={() => setShowEnroll(false)} />
      )}
    </div>
  );
}
