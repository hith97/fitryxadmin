import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight,
  Clock, Grid2x2, LayoutList, LogIn, LogOut,
  QrCode, RefreshCw, Search, Timer,
  UserCheck, UserPlus, Users, X, Zap,
} from 'lucide-react';
import {
  format, isToday, isYesterday,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  addMonths, subMonths,
  isSameDay, isBefore, isAfter,
  eachDayOfInterval, startOfDay,
  getDay, getDaysInMonth,
} from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { attendanceApi, memberApi } from '../services/planApi';
import Avatar from '../components/ui/Avatar';

// ─── Constants ────────────────────────────────────────────────────
const PRESETS = [
  { key: 'today',     label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week',      label: 'This Week' },
  { key: 'month',     label: 'This Month' },
  { key: 'year',      label: 'This Year' },
  { key: 'custom',    label: 'Custom' },
];

const METHOD_CFG = {
  QR_SCAN:       { label: 'Scan',   icon: QrCode,   cls: 'text-sky-600' },
  MANUAL:        { label: 'Manual', icon: Grid2x2,  cls: 'text-violet-600' },
  CLASS_CHECKIN: { label: 'Class',  icon: Users,    cls: 'text-emerald-600' },
  AUTO:          { label: 'Auto',   icon: Zap,      cls: 'text-amber-600' },
};

// ─── Date helpers ─────────────────────────────────────────────────
function presetToRange(preset) {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: now };
    case 'yesterday': {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      return { from: startOfDay(y), to: new Date(y.setHours(23, 59, 59, 999)) };
    }
    case 'week':
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: now };
    case 'month':
      return { from: startOfMonth(now), to: now };
    case 'year':
      return { from: startOfYear(now), to: now };
    default:
      return { from: startOfDay(now), to: now };
  }
}

function rangeLabel(preset, customRange) {
  const now = new Date();
  if (preset === 'today') return `Today, ${format(now, 'EEEE MMMM d')}`;
  if (preset === 'yesterday') { const y = new Date(now); y.setDate(y.getDate()-1); return `Yesterday, ${format(y, 'EEEE MMMM d')}`; }
  if (preset === 'week') return `This Week, ${format(startOfWeek(now, { weekStartsOn: 1 }), 'MMM d')} – ${format(now, 'MMM d')}`;
  if (preset === 'month') return `${format(now, 'MMMM yyyy')}`;
  if (preset === 'year') return `${format(now, 'yyyy')}`;
  if (preset === 'custom' && customRange?.from && customRange?.to) {
    return `${format(customRange.from, 'MMM d')} – ${format(customRange.to, 'MMM d, yyyy')}`;
  }
  return 'Custom Range';
}

function fmtTime(d) { return format(new Date(d), 'h:mm a'); }
function fmtDuration(checkIn, checkOut) {
  const mins = Math.round((new Date(checkOut) - new Date(checkIn)) / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : `${h} hours`;
}
function sinceNow(checkIn) {
  const mins = Math.round((Date.now() - new Date(checkIn)) / 60000);
  if (mins < 60) return `${mins} minutes`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : `${h} hours`;
}

// ─── Stat card ────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, iconCls, sub }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconCls}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 leading-tight">{value ?? 0}</div>
        <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ─── Method chip ──────────────────────────────────────────────────
function MethodChip({ method }) {
  const cfg = METHOD_CFG[method] ?? METHOD_CFG.MANUAL;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${cfg.cls}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────
function StatusBadge({ inGym }) {
  return inGym ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500 px-2.5 py-1 text-[11px] font-semibold text-white">
      <span className="h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse" /> In Gym
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
      Checked Out
    </span>
  );
}

// ─── Member card (cards view) ─────────────────────────────────────
function MemberCard({ rec, onCheckout }) {
  const inGym = !rec.checkOut;
  return (
    <div className={`relative rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${inGym ? 'border-teal-100' : 'border-slate-100'}`}>
      {/* Status dot */}
      <span className={`absolute right-4 top-4 h-2.5 w-2.5 rounded-full ${inGym ? 'bg-teal-400' : 'bg-slate-300'}`} />

      {/* Member info */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={rec.member?.fullName ?? '?'} size="md" />
        <div>
          <div className="font-semibold text-slate-900 text-sm leading-tight">{rec.member?.fullName}</div>
          <div className="mt-1"><StatusBadge inGym={inGym} /></div>
        </div>
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <div className="text-[10px] text-slate-400 mb-0.5">Check-in</div>
          <div className="text-sm font-bold text-slate-800">{fmtTime(rec.checkIn)}</div>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <div className="text-[10px] text-slate-400 mb-0.5">Check-out</div>
          <div className="text-sm font-bold text-slate-800">{rec.checkOut ? fmtTime(rec.checkOut) : '—'}</div>
        </div>
      </div>

      {/* Duration + method */}
      <div className="flex items-center justify-between text-[12px] text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <Clock size={12} className="text-slate-400" />
          {rec.checkOut ? fmtDuration(rec.checkIn, rec.checkOut) : sinceNow(rec.checkIn)}
        </span>
        <MethodChip method={rec.method} />
      </div>

      {/* Check-out button */}
      {inGym && (
        <button
          onClick={() => onCheckout(rec.id)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 py-2 text-sm font-semibold text-teal-600 hover:bg-teal-50 transition-colors"
        >
          <LogOut size={14} /> Check Out
        </button>
      )}
    </div>
  );
}

// ─── Table view ───────────────────────────────────────────────────
function TableView({ records, onCheckout }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Member</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Check In</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Check Out</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Duration</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Method</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Status</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {records.map((rec) => {
            const inGym = !rec.checkOut;
            return (
              <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={rec.member?.fullName ?? '?'} size="sm" />
                    <div>
                      <div className="font-semibold text-slate-900 text-[13px]">{rec.member?.fullName}</div>
                      <div className="text-[11px] text-slate-400">{rec.member?.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] font-semibold text-slate-800">
                  {fmtTime(rec.checkIn)}
                </td>
                <td className="px-4 py-3 text-[13px] font-semibold text-slate-800">
                  {rec.checkOut ? fmtTime(rec.checkOut) : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3 text-[13px] text-slate-500">
                  {rec.checkOut ? fmtDuration(rec.checkIn, rec.checkOut) : sinceNow(rec.checkIn)}
                </td>
                <td className="px-4 py-3"><MethodChip method={rec.method} /></td>
                <td className="px-4 py-3"><StatusBadge inGym={inGym} /></td>
                <td className="px-4 py-3 text-right">
                  {inGym && (
                    <button
                      onClick={() => onCheckout(rec.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                    >
                      <LogOut size={12} /> Check Out
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Custom date range picker ─────────────────────────────────────
function CalendarPicker({ value, onChange, onClose }) {
  const [viewMonth, setViewMonth] = useState(subMonths(new Date(), 1));
  const [selecting, setSelecting] = useState(null); // 'from' | 'to' | null
  const [hover, setHover] = useState(null);
  const [local, setLocal] = useState(value ?? { from: null, to: null });

  const month1 = viewMonth;
  const month2 = addMonths(viewMonth, 1);

  const handleDayClick = (day) => {
    if (!local.from || (local.from && local.to)) {
      setLocal({ from: day, to: null });
    } else {
      if (isBefore(day, local.from)) {
        setLocal({ from: day, to: local.from });
      } else {
        setLocal({ from: local.from, to: day });
      }
    }
  };

  const inRange = (day) => {
    if (!local.from) return false;
    const end = local.to ?? hover;
    if (!end) return false;
    const [s, e] = isBefore(local.from, end) ? [local.from, end] : [end, local.from];
    return isAfter(day, s) && isBefore(day, e);
  };

  const isRangeEnd = (day) => {
    if (!local.from) return false;
    if (local.to) return isSameDay(day, local.from) || isSameDay(day, local.to);
    return isSameDay(day, local.from);
  };

  const apply = () => {
    if (local.from && local.to) { onChange(local); onClose(); }
    else if (local.from) { onChange({ from: local.from, to: local.from }); onClose(); }
  };

  return (
    <div className="absolute right-0 top-full mt-2 z-50 rounded-2xl border border-slate-200 bg-white shadow-2xl p-5 w-[640px]">
      <div className="text-xs font-semibold text-slate-500 mb-4">Select a date range</div>

      <div className="grid grid-cols-2 gap-6">
        {[month1, month2].map((m, mi) => {
          const firstDay = new Date(m.getFullYear(), m.getMonth(), 1);
          const startOffset = getDay(firstDay); // 0=Sun
          const days = getDaysInMonth(m);

          return (
            <div key={mi}>
              {/* Month header */}
              <div className="flex items-center justify-between mb-3">
                {mi === 0 ? (
                  <button onClick={() => setViewMonth(subMonths(viewMonth, 1))} className="rounded-lg p-1 hover:bg-slate-100">
                    <ChevronLeft size={14} />
                  </button>
                ) : <div className="w-6" />}
                <span className="text-sm font-semibold text-slate-800">{format(m, 'MMMM yyyy')}</span>
                {mi === 1 ? (
                  <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="rounded-lg p-1 hover:bg-slate-100">
                    <ChevronRight size={14} />
                  </button>
                ) : <div className="w-6" />}
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 mb-1">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7">
                {Array(startOffset).fill(null).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: days }, (_, i) => {
                  const day = new Date(m.getFullYear(), m.getMonth(), i + 1);
                  const isEnd = isRangeEnd(day);
                  const inR = inRange(day);
                  const isFuture = isAfter(day, new Date());
                  return (
                    <button
                      key={i}
                      disabled={isFuture}
                      onClick={() => !isFuture && handleDayClick(day)}
                      onMouseEnter={() => setHover(day)}
                      onMouseLeave={() => setHover(null)}
                      className={`
                        relative text-center text-[12px] py-1.5 transition-colors
                        ${isFuture ? 'text-slate-200 cursor-not-allowed' : 'cursor-pointer'}
                        ${isEnd ? 'rounded-full bg-teal-500 text-white font-semibold' : ''}
                        ${inR && !isEnd ? 'bg-teal-50 text-teal-700' : ''}
                        ${!isEnd && !inR && !isFuture ? 'hover:bg-slate-100 rounded-full text-slate-700' : ''}
                      `}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={apply}
        disabled={!local.from}
        className="mt-5 w-full rounded-2xl bg-teal-500 py-3 text-sm font-semibold text-white hover:bg-teal-600 transition-colors disabled:opacity-40"
      >
        Apply Range
      </button>
    </div>
  );
}

// ─── Quick Check-In Modal ─────────────────────────────────────────
function QuickCheckinModal({ isOpen, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('manual');
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['members-active', search],
    queryFn: () => memberApi.list({ search: search || undefined, status: 'ACTIVE', limit: 20 }),
    enabled: isOpen,
  });
  const members = membersData?.data ?? [];

  const checkinMutation = useMutation({
    mutationFn: ({ memberId, isOverride }) =>
      attendanceApi.manualCheckin({ memberId, isOverride }),
    onSuccess: (data, vars) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ['attendance'] });
        onSuccess?.();
      } else if (data.code === 'ALREADY_CHECKED_IN') {
        if (window.confirm(`Already checked in. Override?`)) {
          checkinMutation.mutate({ memberId: vars.memberId, isOverride: true });
        }
      } else if (data.code === 'SUBSCRIPTION_INACTIVE') {
        toast.error(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (isOpen) { setSearch(''); setTimeout(() => inputRef.current?.focus(), 80); }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[28px] border border-slate-200 bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <UserCheck size={20} className="text-teal-500" />
            <span className="text-base font-bold text-slate-900">Quick Check-In</span>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>

        {/* Tab toggle */}
        <div className="px-6 pb-4">
          <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1 gap-1">
            <button
              onClick={() => setTab('manual')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                tab === 'manual' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Grid2x2 size={14} /> Manual
            </button>
            <button
              onClick={() => setTab('scan')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                tab === 'scan' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <QrCode size={14} /> Scan Code
            </button>
          </div>
        </div>

        {tab === 'manual' ? (
          <>
            {/* Search */}
            <div className="px-6 pb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, phone or member ID…"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-400 focus:bg-white"
                />
              </div>
            </div>

            {/* Member list */}
            <div className="max-h-72 overflow-y-auto px-2 pb-4">
              {membersLoading ? (
                <div className="py-8 text-center text-sm text-slate-400">Loading members…</div>
              ) : members.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">No active members found</div>
              ) : (
                members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <Avatar name={m.fullName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{m.fullName}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {m.activePlan?.name ?? m.phone}
                      </div>
                    </div>
                    <button
                      onClick={() => checkinMutation.mutate({ memberId: m.id, isOverride: false })}
                      disabled={checkinMutation.isPending}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-colors disabled:opacity-40"
                      title={`Check in ${m.fullName}`}
                    >
                      <UserPlus size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Scan tab — web placeholder */
          <div className="px-6 pb-8 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-4">
              <QrCode size={36} className="text-slate-400" />
            </div>
            <div className="text-sm font-semibold text-slate-700 mb-2">Use the Mobile App</div>
            <div className="text-xs text-slate-400 leading-5">
              QR scanning is available in the Fitryx mobile app. Members can scan the venue QR code directly from their phone.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────
export default function Attendance() {
  const queryClient = useQueryClient();

  const [preset, setPreset]         = useState('today');
  const [customRange, setCustomRange] = useState(null);
  const [showCal, setShowCal]       = useState(false);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView]             = useState('cards'); // 'cards' | 'table'
  const [showModal, setShowModal]   = useState(false);
  const [page, setPage]             = useState(1);
  const calRef = useRef(null);

  // Close calendar on outside click
  useEffect(() => {
    const handler = (e) => { if (calRef.current && !calRef.current.contains(e.target)) setShowCal(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Compute API from/to
  const getRange = useCallback(() => {
    if (preset === 'custom' && customRange?.from && customRange?.to) return customRange;
    return presetToRange(preset);
  }, [preset, customRange]);

  const range = getRange();
  const fromStr = format(range.from, 'yyyy-MM-dd');
  const toStr   = format(range.to,   'yyyy-MM-dd');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['attendance', { from: fromStr, to: toStr, search, status: statusFilter, page }],
    queryFn: () =>
      attendanceApi.list({
        from: fromStr, to: toStr,
        search: search || undefined,
        status: statusFilter || undefined,
        page, limit: 50,
      }),
    keepPreviousData: true,
    refetchInterval: 30_000,
  });

  const records = data?.data ?? [];
  const meta    = data?.meta ?? { total: 0, totalPages: 1 };
  const stats   = data?.stats ?? { totalPeriod: 0, inGymNow: 0, checkedOutPeriod: 0, avgDuration: 0 };

  const checkoutMutation = useMutation({
    mutationFn: (id) => attendanceApi.checkout(id),
    onSuccess: (res) => {
      toast[res.success ? 'success' : 'error'](res.message);
      if (res.success) queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err) => toast.error(err.message),
  });

  const autoCheckoutMutation = useMutation({
    mutationFn: () => attendanceApi.autoCheckout(8),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleAutoCheckout = () => {
    if (stats.inGymNow === 0) { toast('No one is currently in the gym.'); return; }
    if (window.confirm(`Auto check-out ${stats.inGymNow} member${stats.inGymNow !== 1 ? 's' : ''} who have been in for 8+ hours?`)) {
      autoCheckoutMutation.mutate();
    }
  };

  const handlePreset = (key) => {
    setPreset(key);
    setPage(1);
    if (key === 'custom') setShowCal(true);
    else setShowCal(false);
  };

  const subtitle = `${rangeLabel(preset, customRange)} — ${meta.total} entries`;

  const statusCounts = { '': meta.total, IN: stats.inGymNow, OUT: stats.checkedOutPeriod };

  return (
    <div className="max-w-full mx-auto pb-12 space-y-6">
      <QuickCheckinModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['attendance'] })}
      />

      {/* ── Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[2rem] font-bold tracking-tight text-slate-900">Attendance</h1>
          <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <button
            onClick={handleAutoCheckout}
            disabled={autoCheckoutMutation.isPending}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={15} className={autoCheckoutMutation.isPending ? 'animate-spin' : ''} />
            Auto Check-out
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 transition-colors shadow-sm"
          >
            <UserCheck size={16} /> Check In
          </button>
        </div>
      </div>

      {/* ── Date preset bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => {
          const isCustomActive = p.key === 'custom' && preset === 'custom' && customRange?.from;
          const isActive = preset === p.key;
          return (
            <div key={p.key} className="relative" ref={p.key === 'custom' ? calRef : null}>
              <button
                onClick={() => handlePreset(p.key)}
                className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {p.key === 'custom' && <CalendarDays size={14} />}
                {isCustomActive ? rangeLabel('custom', customRange) : p.label}
                {p.key === 'custom' && <ChevronRight size={12} className={`transition-transform ${showCal ? 'rotate-90' : ''}`} />}
              </button>
              {p.key === 'custom' && showCal && (
                <CalendarPicker
                  value={customRange}
                  onChange={(r) => { setCustomRange(r); setPreset('custom'); setPage(1); }}
                  onClose={() => setShowCal(false)}
                />
              )}
            </div>
          );
        })}

        {/* Refresh indicator */}
        {isFetching && !isLoading && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <RefreshCw size={11} className="animate-spin" /> Refreshing…
          </span>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Users}     label="Total Today"  value={stats.totalPeriod}       iconCls="bg-blue-50 text-blue-500" />
        <StatCard icon={LogIn}     label="In Gym"       value={stats.inGymNow}          iconCls="bg-teal-50 text-teal-500" />
        <StatCard icon={LogOut}    label="Checked Out"  value={stats.checkedOutPeriod}  iconCls="bg-slate-100 text-slate-500" />
        <StatCard icon={Timer}     label="Avg Duration" value={stats.avgDuration ? `${stats.avgDuration}m` : '—'} iconCls="bg-amber-50 text-amber-500" />
      </div>

      {/* ── Toolbar: search + status + view toggle ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, phone or member ID…"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none focus:border-teal-400"
          />
        </div>

        {/* Status dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-teal-400 cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="IN">In Gym ({stats.inGymNow})</option>
            <option value="OUT">Checked Out ({stats.checkedOutPeriod})</option>
          </select>
          <ChevronRight size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400" />
        </div>

        {/* View toggle */}
        <div className="flex rounded-2xl border border-slate-200 bg-white shadow-sm p-1 gap-1">
          <button
            onClick={() => setView('cards')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              view === 'cards' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Grid2x2 size={14} /> Cards
          </button>
          <button
            onClick={() => setView('table')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              view === 'table' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutList size={14} /> Table
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-24 shadow-sm">
          <div className="h-8 w-8 rounded-full border-2 border-teal-200 border-t-teal-500 animate-spin" />
          <div className="mt-4 text-sm text-slate-400">Loading attendance…</div>
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-24 shadow-sm text-center px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
            <UserCheck size={28} className="text-slate-300" />
          </div>
          <div className="text-base font-semibold text-slate-700">No check-ins found</div>
          <div className="mt-1 text-sm text-slate-400 mb-6">
            {preset === 'today' ? 'No members have checked in yet today.' : 'No records found for the selected period.'}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 transition-colors"
          >
            <UserPlus size={15} /> Manual Check-In
          </button>
        </div>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {records.map((rec) => (
            <MemberCard key={rec.id} rec={rec} onCheckout={(id) => checkoutMutation.mutate(id)} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <TableView records={records} onCheckout={(id) => checkoutMutation.mutate(id)} />

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3">
            <span className="text-xs text-slate-500">
              Showing <strong className="text-slate-800">{records.length}</strong> of{' '}
              <strong className="text-slate-800">{meta.total}</strong>
            </span>
            {meta.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                  className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-white">
                  Prev
                </button>
                <span className="text-xs font-semibold text-slate-600">{page} / {meta.totalPages}</span>
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
}
