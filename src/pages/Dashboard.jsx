import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  DollarSign,
  Dumbbell,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  CartesianGrid,
  Cell,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../services/planApi';

// ── Design tokens ─────────────────────────────────────────────────
const panelClass =
  'rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]';

const numberFormatter = new Intl.NumberFormat('en-IN');

const PIE_COLORS = ['#6C63FF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#14B8A6', '#8B5CF6'];

const toneClasses = {
  emerald: {
    border: 'border-emerald-200', accent: 'border-l-4 border-l-emerald-500',
    soft: 'bg-emerald-50 text-emerald-600', badge: 'bg-emerald-50 text-emerald-700', progress: 'bg-emerald-500',
  },
  slate: {
    border: 'border-slate-200', accent: 'border-l-4 border-l-slate-400',
    soft: 'bg-slate-100 text-slate-600', badge: 'bg-slate-100 text-slate-700', progress: 'bg-slate-500',
  },
  blue: {
    border: 'border-blue-200', accent: 'border-l-4 border-l-blue-500',
    soft: 'bg-blue-50 text-blue-600', badge: 'bg-blue-50 text-blue-700', progress: 'bg-blue-500',
  },
  indigo: {
    border: 'border-indigo-200', accent: 'border-l-4 border-l-primary',
    soft: 'bg-primary-light text-primary', badge: 'bg-primary-light text-primary', progress: 'bg-primary',
  },
  violet: {
    border: 'border-violet-200', accent: 'border-l-4 border-l-violet-500',
    soft: 'bg-violet-50 text-violet-600', badge: 'bg-violet-50 text-violet-700', progress: 'bg-violet-500',
  },
  teal: {
    border: 'border-teal-200', accent: 'border-l-4 border-l-teal-500',
    soft: 'bg-teal-50 text-teal-600', badge: 'bg-teal-50 text-teal-700', progress: 'bg-teal-500',
  },
  amber: {
    border: 'border-amber-200', accent: 'border-l-4 border-l-amber-500',
    soft: 'bg-amber-50 text-amber-600', badge: 'bg-amber-50 text-amber-700', progress: 'bg-amber-500',
  },
  rose: {
    border: 'border-rose-200', accent: 'border-l-4 border-l-rose-500',
    soft: 'bg-rose-50 text-rose-600', badge: 'bg-rose-50 text-rose-700', progress: 'bg-rose-500',
  },
};

// ── Date helpers ──────────────────────────────────────────────────

const PRESETS = ['Today', 'Yesterday', 'Week', 'Month', 'Year', 'Custom'];

function presetToRange(preset) {
  const now = new Date();
  const today = (d) => { d.setHours(0, 0, 0, 0); return d; };
  const eod = (d) => { d.setHours(23, 59, 59, 999); return d; };

  if (preset === 'Today') {
    return { from: today(new Date()), to: eod(new Date()) };
  }
  if (preset === 'Yesterday') {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    return { from: today(new Date(y)), to: eod(new Date(y)) };
  }
  if (preset === 'Week') {
    const f = new Date(now); f.setDate(f.getDate() - 6);
    return { from: today(f), to: eod(new Date()) };
  }
  if (preset === 'Month') {
    const f = new Date(now); f.setDate(f.getDate() - 29);
    return { from: today(f), to: eod(new Date()) };
  }
  if (preset === 'Year') {
    const f = new Date(now); f.setFullYear(f.getFullYear() - 1);
    return { from: today(f), to: eod(new Date()) };
  }
  return null;
}

function formatDateLabel(dateStr, rangePreset) {
  const d = new Date(dateStr);
  if (rangePreset === 'Year') {
    return d.toLocaleDateString('en-US', { month: 'short' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function toISO(date) {
  return date ? date.toISOString().split('T')[0] : undefined;
}

function periodLabel(preset, customRange) {
  if (preset !== 'Custom') return preset;
  if (!customRange?.from || !customRange?.to) return 'Custom Range';
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(customRange.from)} – ${fmt(customRange.to)}`;
}

// ── Formatters ────────────────────────────────────────────────────

const formatCurrencyTick = (v) =>
  v === 0 ? '₹0' : v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${Math.round(v / 1000)}k`;

const fmtRupee = (v) => `₹${numberFormatter.format(Math.round(v ?? 0))}`;

// ── Tooltips ──────────────────────────────────────────────────────

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-3 text-sm">
        <div className="flex justify-between gap-6">
          <span className="text-slate-500">Revenue</span>
          <span className="font-semibold text-emerald-600">{fmtRupee(payload[0]?.value)}</span>
        </div>
      </div>
    </div>
  );
};

const DistributionTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <div className="text-sm font-semibold text-slate-900">{item?.name}</div>
      <div className="mt-1 text-sm text-slate-500">{`${numberFormatter.format(item?.value ?? 0)} members`}</div>
    </div>
  );
};

const PeakHoursTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="mt-1 text-sm text-slate-500">{`${numberFormatter.format(payload[0]?.value ?? 0)} visits`}</div>
    </div>
  );
};

// ── Skeleton loader ───────────────────────────────────────────────

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />
);

// ── Sub-components ────────────────────────────────────────────────

const HeroStat = ({ label, value, tone = 'blue', loading }) => {
  const style = toneClasses[tone] || toneClasses.blue;
  return (
    <div className="rounded-[20px] border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-24" />
      ) : (
        <div className={`mt-2 text-xl font-bold ${tone === 'emerald' ? 'text-emerald-600' : tone === 'indigo' ? 'text-primary' : 'text-slate-900'}`}>
          {value}
        </div>
      )}
      <div className="mt-3 h-1.5 rounded-full bg-slate-100">
        <div className={`h-full w-2/3 rounded-full ${style.progress}`} />
      </div>
    </div>
  );
};

const SnapshotTile = ({ icon: Icon, label, value, tone = 'blue', loading }) => {
  const style = toneClasses[tone] || toneClasses.blue;
  return (
    <div className="bg-white px-5 py-5 transition-colors duration-200 hover:bg-slate-50/80">
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${style.soft}`}>
        <Icon size={18} />
      </div>
      {loading ? <Skeleton className="h-9 w-20" /> : (
        <div className="text-[1.9rem] font-bold leading-none text-slate-900">{value}</div>
      )}
      <div className="mt-2 text-sm font-medium text-slate-500">{label}</div>
    </div>
  );
};

const KpiCard = ({ icon: Icon, label, detail, value, tone = 'blue', change, loading }) => {
  const style = toneClasses[tone] || toneClasses.blue;
  return (
    <div className={`${panelClass} ${style.accent} p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)] sm:p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${style.soft}`}>
          <Icon size={20} />
        </div>
        {change != null && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="mt-6">
        {loading ? <Skeleton className="h-10 w-28" /> : (
          <div className="text-[2rem] font-bold leading-none text-slate-900">{value}</div>
        )}
        <div className="mt-2 text-[15px] font-semibold text-slate-700">{label}</div>
        <div className="mt-1 text-sm text-slate-500">{detail}</div>
      </div>
    </div>
  );
};

// ── Calendar-based date range picker ─────────────────────────────

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function buildCalendar(year, month) {
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(d, from, to) {
  return d && from && to && d > from && d < to;
}

const CalendarMonth = ({ year, month, from, to, hovered, onDay, onHover }) => {
  const cells = buildCalendar(year, month);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div className="w-full">
      <div className="mb-3 text-center text-sm font-semibold text-slate-800">
        {MONTHS[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {DAYS.map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">{d}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const isFrom = isSameDay(date, from);
          const isTo = isSameDay(date, to);
          const isEnd = isFrom || isTo;
          const inRange = isBetween(date, from, to || hovered);
          const isHoverEnd = hovered && isSameDay(date, hovered);
          const isFuture = date > today;

          return (
            <button
              key={date.toISOString()}
              disabled={isFuture}
              onClick={() => onDay(date)}
              onMouseEnter={() => onHover(date)}
              onMouseLeave={() => onHover(null)}
              className={[
                'relative h-8 w-full text-[13px] font-medium transition-colors select-none',
                isFuture ? 'cursor-not-allowed text-slate-200' : 'cursor-pointer',
                isEnd
                  ? 'z-10 rounded-xl bg-primary text-white shadow-sm'
                  : inRange
                  ? 'bg-primary/10 text-primary'
                  : isHoverEnd && from && !to
                  ? 'rounded-xl bg-primary/20 text-primary'
                  : 'rounded-xl text-slate-700 hover:bg-slate-100',
                (isFrom && (to || hovered)) ? 'rounded-r-none' : '',
                (isTo || (isHoverEnd && from && !to)) ? 'rounded-l-none' : '',
                inRange && !isEnd ? 'rounded-none' : '',
              ].filter(Boolean).join(' ')}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const QUICK_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

const CustomRangePicker = ({ value, onChange, onClose }) => {
  const ref = useRef(null);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [from, setFrom] = useState(value?.from ?? null);
  const [to, setTo] = useState(value?.to ?? null);
  const [hovered, setHovered] = useState(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const prevMonth = viewMonth === 0
    ? { year: viewYear - 1, month: 11 }
    : { year: viewYear, month: viewMonth - 1 };

  const goBack = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const goForward = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const handleDay = (date) => {
    if (!from || (from && to)) {
      const d = new Date(date); d.setHours(0, 0, 0, 0);
      setFrom(d); setTo(null);
    } else {
      if (date < from) {
        const d = new Date(date); d.setHours(0, 0, 0, 0);
        setFrom(d); setTo(null);
      } else {
        const d = new Date(date); d.setHours(23, 59, 59, 999);
        setTo(d);
      }
    }
  };

  const apply = () => {
    if (!from || !to) return;
    onChange({ from, to });
    onClose();
  };

  const applyQuick = (days) => {
    const t = new Date(); t.setHours(23, 59, 59, 999);
    const f = new Date(); f.setDate(f.getDate() - (days - 1)); f.setHours(0, 0, 0, 0);
    onChange({ from: f, to: t });
    onClose();
  };

  const fmtSel = (d) => d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div
      ref={ref}
      className="fixed right-4 top-20 z-[100] w-[min(640px,calc(100vw-2rem))] rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light">
            <Calendar size={16} className="text-primary" />
          </div>
          <span className="text-sm font-semibold text-slate-800">Select Date Range</span>
        </div>
        <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex gap-0">
        {/* Quick presets sidebar */}
        <div className="w-40 shrink-0 border-r border-slate-100 p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Quick Select</p>
          <div className="space-y-1">
            {QUICK_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyQuick(p.days)}
                className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1 p-4">
          {/* Nav */}
          <div className="mb-4 flex items-center justify-between">
            <button onClick={goBack} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <ChevronDown size={16} className="rotate-90" />
            </button>
            <span className="text-xs font-semibold text-slate-500">
              {MONTHS[prevMonth.month].slice(0, 3)} {prevMonth.year} — {MONTHS[viewMonth].slice(0, 3)} {viewYear}
            </span>
            <button onClick={goForward} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <ChevronDown size={16} className="-rotate-90" />
            </button>
          </div>

          {/* Two months */}
          <div className="grid grid-cols-2 gap-6">
            <CalendarMonth
              year={prevMonth.year} month={prevMonth.month}
              from={from} to={to} hovered={hovered}
              onDay={handleDay} onHover={setHovered}
            />
            <CalendarMonth
              year={viewYear} month={viewMonth}
              from={from} to={to} hovered={hovered}
              onDay={handleDay} onHover={setHovered}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From</span>
            <div className={`mt-0.5 font-semibold ${from ? 'text-primary' : 'text-slate-300'}`}>{fmtSel(from)}</div>
          </div>
          <div className="h-px w-6 bg-slate-200" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">To</span>
            <div className={`mt-0.5 font-semibold ${to ? 'text-primary' : 'text-slate-300'}`}>{fmtSel(to)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={apply}
            disabled={!from || !to}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [preset, setPreset] = useState('Month');
  const [customRange, setCustomRange] = useState(null);
  const [showCustom, setShowCustom] = useState(false);

  const range = useMemo(() => {
    if (preset === 'Custom') return customRange;
    return presetToRange(preset);
  }, [preset, customRange]);

  const fromStr = range ? toISO(range.from) : undefined;
  const toStr = range ? toISO(range.to) : undefined;

  // ── API queries ───────────────────────────────────────────────────
  const { data: snapshot, isLoading: snapLoading, refetch: refetchSnap } = useQuery({
    queryKey: ['dashboard-snapshot'],
    queryFn: dashboardApi.snapshot,
    refetchInterval: 60_000,
  });

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats', fromStr, toStr],
    queryFn: () => dashboardApi.stats(fromStr, toStr),
    enabled: !!range,
  });

  const { data: revenueData, isLoading: revLoading } = useQuery({
    queryKey: ['dashboard-revenue', fromStr, toStr],
    queryFn: () => dashboardApi.revenueChart(fromStr, toStr),
    enabled: !!range,
  });

  const { data: peakHoursData, isLoading: peakLoading } = useQuery({
    queryKey: ['dashboard-peak-hours', fromStr, toStr],
    queryFn: () => dashboardApi.peakHours(fromStr, toStr),
    enabled: !!range,
  });

  const { data: distData, isLoading: distLoading } = useQuery({
    queryKey: ['dashboard-distribution'],
    queryFn: dashboardApi.membershipDistribution,
  });

  const { data: attention, isLoading: attLoading } = useQuery({
    queryKey: ['dashboard-attention'],
    queryFn: dashboardApi.needsAttention,
    refetchInterval: 120_000,
  });

  const refetchAll = () => { refetchSnap(); refetchStats(); };

  // ── Derived values ────────────────────────────────────────────────

  const ownerFirstName = currentUser?.fullName?.split(' ')[0] || 'Partner';
  const businessName = currentUser?.business?.name || 'Your Gym';
  const currentDateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date());

  const revChartData = useMemo(() => {
    if (!revenueData) return [];
    return revenueData.map((d) => ({
      ...d,
      label: formatDateLabel(d.date, preset),
    }));
  }, [revenueData, preset]);

  const peakHours = peakHoursData ?? [];
  const busiestHour = peakHours.length
    ? peakHours.reduce((best, cur) => (cur.value > best.value ? cur : best))
    : { time: '—', value: 0 };
  const avgVisits = peakHours.length
    ? Math.round(peakHours.reduce((sum, h) => sum + h.value, 0) / peakHours.length)
    : 0;

  const distribution = useMemo(() =>
    (distData ?? []).map((d, i) => ({ ...d, color: PIE_COLORS[i % PIE_COLORS.length] })),
    [distData],
  );
  const membershipTotal = distribution.reduce((s, d) => s + d.value, 0);

  const totalRevenue = stats?.totalRevenue ?? 0;
  const activeMembers = stats?.activeMembers ?? 0;
  const newMembers = stats?.newMembers ?? 0;
  const renewals = stats?.renewals ?? 0;
  const periodAttendance = stats?.periodAttendance ?? 0;

  // Needs attention items
  const attentionItems = useMemo(() => {
    if (!attention) return [];
    const items = [];
    if ((attention.overdueFollowUps ?? []).length > 0) {
      items.push({
        title: 'Overdue Follow-Ups',
        description: `${attention.overdueFollowUps.length} lead${attention.overdueFollowUps.length === 1 ? '' : 's'} awaiting follow-up.`,
        badge: `${attention.overdueFollowUps.length} pending`,
        action: 'View Leads',
        icon: AlertTriangle,
        tone: 'amber',
        href: '/leads',
      });
    }
    if ((attention.expiringMemberships ?? []).length > 0) {
      items.push({
        title: 'Memberships Expiring Soon',
        description: `${attention.expiringMemberships.length} member${attention.expiringMemberships.length === 1 ? '' : 's'} expire within 7 days.`,
        badge: `${attention.expiringMemberships.length} expiring`,
        action: 'View Subscriptions',
        icon: Clock,
        tone: 'rose',
        href: '/subscriptions',
      });
    }
    if ((attention.inactiveStaffCount ?? 0) > 0) {
      items.push({
        title: 'Inactive Staff',
        description: `${attention.inactiveStaffCount} staff member${attention.inactiveStaffCount === 1 ? '' : 's'} currently inactive.`,
        badge: `${attention.inactiveStaffCount} inactive`,
        action: 'Manage Staff',
        icon: Users,
        tone: 'slate',
        href: '/staff',
      });
    }
    return items;
  }, [attention]);

  // ── Preset dropdown ───────────────────────────────────────────────

  const handlePresetSelect = (p) => {
    if (p === 'Custom') {
      setShowCustom(true);
    } else {
      setPreset(p);
      setShowCustom(false);
    }
  };

  const label = periodLabel(preset, customRange);

  return (
    <div className="mx-auto max-w-[1480px] space-y-6 pb-10">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <section className={`${panelClass} relative overflow-hidden px-6 py-6 sm:px-7 sm:py-7`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(108,99,255,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(34,197,94,0.12),_transparent_30%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-[620px]">
            <div className="mb-3 flex items-center gap-3">
              <img src="/logo.png" alt="Fitryx" className="h-9 w-auto" />
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <Activity size={14} />
                Live Operations
              </div>
            </div>
            <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 sm:text-[2.5rem]">
              Welcome back, {ownerFirstName}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-[15px]">
              Here&apos;s what&apos;s happening at {businessName} — revenue, traffic, and memberships in one view.
            </p>
          </div>

          <div className="w-full xl:max-w-[560px]">
            {/* ── Date filter ─────────────────────────────── */}
            <div className="relative mb-4 flex flex-wrap items-center gap-3 xl:justify-end">
              {/* Preset pills */}
              <div className="flex flex-wrap gap-2">
                {PRESETS.filter((p) => p !== 'Custom').map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePresetSelect(p)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      preset === p && preset !== 'Custom'
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => handlePresetSelect('Custom')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    preset === 'Custom'
                      ? 'bg-primary text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  <Calendar size={13} />
                  {preset === 'Custom' ? label : 'Custom'}
                  <ChevronDown size={12} />
                </button>
              </div>

              <Button variant="secondary" onClick={refetchAll} className="h-9 w-9 rounded-xl p-0">
                <RefreshCw size={16} />
              </Button>

              {showCustom && (
                <CustomRangePicker
                  value={customRange}
                  onChange={(r) => { setCustomRange(r); setPreset('Custom'); }}
                  onClose={() => setShowCustom(false)}
                />
              )}
            </div>

            {/* ── Hero stats ──────────────────────────────── */}
            <div className="grid gap-3 sm:grid-cols-3">
              <HeroStat label="Total Revenue" value={fmtRupee(totalRevenue)} tone="emerald" loading={statsLoading} />
              <HeroStat label="Active Members" value={numberFormatter.format(activeMembers)} tone="indigo" loading={statsLoading} />
              <HeroStat label="Check-Ins Today" value={numberFormatter.format(snapshot?.checkInsToday ?? 0)} tone="blue" loading={snapLoading} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Today's Snapshot ─────────────────────────────────────── */}
      <section className={`${panelClass} overflow-hidden`}>
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <Activity size={17} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Today&apos;s Snapshot</h2>
          </div>
          <div className="text-sm text-slate-500">{currentDateLabel}</div>
        </div>
        <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-5">
          <SnapshotTile icon={CheckCircle} label="Check-Ins Today" value={snapshot?.checkInsToday ?? 0} tone="emerald" loading={snapLoading} />
          <SnapshotTile icon={Dumbbell} label="Currently In Gym" value={snapshot?.currentlyIn ?? 0} tone="indigo" loading={snapLoading} />
          <SnapshotTile icon={Clock} label="Expiring (7 days)" value={snapshot?.expiringSoon ?? 0} tone="amber" loading={snapLoading} />
          <SnapshotTile icon={UserPlus} label="Pending Leads" value={snapshot?.pendingLeads ?? 0} tone="blue" loading={snapLoading} />
          <SnapshotTile icon={DollarSign} label="Today's Payments" value={fmtRupee(snapshot?.paymentsToday)} tone="teal" loading={snapLoading} />
        </div>
      </section>

      {/* ── KPI Cards ────────────────────────────────────────────── */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={DollarSign} label="Total Revenue" detail={`${label} period`} value={fmtRupee(totalRevenue)} tone="emerald" loading={statsLoading} />
        <KpiCard icon={UserPlus} label="New Members" detail={`Joined this ${label.toLowerCase()}`} value={numberFormatter.format(newMembers)} tone="indigo" loading={statsLoading} />
        <KpiCard icon={CreditCard} label="Renewals" detail="Returning members" value={numberFormatter.format(renewals)} tone="violet" loading={statsLoading} />
        <KpiCard icon={Activity} label="Total Visits" detail={`Check-ins this ${label.toLowerCase()}`} value={numberFormatter.format(periodAttendance)} tone="teal" loading={statsLoading} />
      </section>

      {/* ── Revenue Chart + Needs Attention ──────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)]">
        <div className={`${panelClass} p-6 sm:p-7`}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Revenue Overview</h3>
              {revLoading ? (
                <Skeleton className="mt-2 h-10 w-36" />
              ) : (
                <div className="mt-2 text-[2rem] font-bold leading-none text-slate-900">{fmtRupee(totalRevenue)}</div>
              )}
              <p className="mt-2 text-sm text-slate-500">{label} period</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <TrendingUp size={17} />
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <BarChart3 size={17} />
              </div>
            </div>
          </div>
          <div className="h-[340px] w-full sm:h-[380px]">
            {revLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revChartData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 6" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} tickFormatter={formatCurrencyTick} width={52} />
                  <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#CBD5E1', strokeDasharray: '3 4' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={3} dot={false}
                    activeDot={{ r: 6, fill: '#22C55E', stroke: '#FFFFFF', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className={`${panelClass} p-6 sm:p-7`}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Needs Attention</h3>
              <p className="mt-2 text-sm text-slate-500">Priority tasks for the team right now.</p>
            </div>
            {!attLoading && (
              <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-600">
                {attentionItems.length} open
              </span>
            )}
          </div>
          {attLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => <Skeleton key={n} className="h-20 w-full rounded-2xl" />)}
            </div>
          ) : attentionItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle size={40} className="text-emerald-400" />
              <p className="mt-4 text-sm font-medium text-slate-600">All clear! Nothing needs attention.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attentionItems.map((item) => {
                const style = toneClasses[item.tone] || toneClasses.blue;
                const Icon = item.icon;
                return (
                  <div key={item.title} className={`rounded-[22px] border ${style.border} bg-white p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5`}>
                    <div className="flex gap-4">
                      <div className={`mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl ${style.soft}`}>
                        <Icon size={19} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                            <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${style.badge}`}>{item.badge}</span>
                        </div>
                        <a href={item.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-primary">
                          {item.action}
                          <ArrowRight size={15} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Membership Distribution + Peak Hours ─────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">More Insights</h3>
            <p className="text-sm text-slate-500">Membership split and daily traffic patterns.</p>
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Membership Distribution */}
          <div className={`${panelClass} p-6 sm:p-7`}>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Membership Distribution</h3>
                <p className="mt-2 text-sm text-slate-500">Breakdown of active plans across the gym.</p>
              </div>
              <div className="rounded-[20px] bg-slate-50 px-4 py-3 text-right">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Total Active</div>
                <div className="mt-1 text-lg font-bold text-slate-900">{numberFormatter.format(membershipTotal)}</div>
              </div>
            </div>
            {distLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : distribution.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-slate-400">No active memberships</div>
            ) : (
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
                <div className="relative mx-auto h-[260px] w-full max-w-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={72} outerRadius={104} paddingAngle={4} cornerRadius={10} stroke="none">
                        {distribution.map((d) => <Cell key={d.name} fill={d.color} />)}
                      </Pie>
                      <Tooltip content={<DistributionTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Members</div>
                    <div className="mt-2 text-3xl font-bold text-slate-900">{numberFormatter.format(membershipTotal)}</div>
                  </div>
                </div>
                <div className="max-h-[340px] space-y-2.5 overflow-y-auto pr-1">
                  {distribution.map((item) => {
                    const pct = membershipTotal ? Math.round((item.value / membershipTotal) * 100) : 0;
                    return (
                      <div key={item.name} className="group rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition-colors hover:bg-white hover:shadow-sm">
                        {/* Top row: dot + name + count */}
                        <div className="flex items-center gap-3">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800" title={item.name}>
                            {item.name}
                          </span>
                          <span className="shrink-0 text-base font-bold text-slate-900">
                            {numberFormatter.format(item.value)}
                          </span>
                          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            members
                          </span>
                        </div>
                        {/* Progress bar + pct */}
                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: item.color }}
                            />
                          </div>
                          <span className="shrink-0 text-[11px] font-semibold" style={{ color: item.color }}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Peak Hours */}
          <div className={`${panelClass} p-6 sm:p-7`}>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Peak Hours</h3>
                <p className="mt-2 text-sm text-slate-500">When your floor is busiest — {label}.</p>
              </div>
              <div className="rounded-[20px] bg-emerald-50 px-4 py-3 text-right">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-500">Busiest Slot</div>
                <div className="mt-1 text-lg font-bold text-emerald-600">{busiestHour.time}</div>
              </div>
            </div>
            <div className="h-[320px] w-full">
              {peakLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHours} barCategoryGap="24%">
                    <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 6" vertical={false} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={8} interval={1} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                    <Tooltip content={<PeakHoursTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                    <Bar dataKey="value" radius={[18, 18, 6, 6]} maxBarSize={40}>
                      {peakHours.map((h) => (
                        <Cell key={h.time} fill={h.time === busiestHour.time ? '#22C55E' : '#6C63FF'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] bg-slate-50 px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Average Traffic</div>
                <div className="mt-2 text-xl font-bold text-slate-900">{numberFormatter.format(avgVisits)}</div>
                <div className="mt-1 text-sm text-slate-500">Avg visits per hour slot</div>
              </div>
              <div className="rounded-[20px] bg-primary-light px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70">Peak Time</div>
                <div className="mt-2 text-xl font-bold text-primary">{busiestHour.time}</div>
                <div className="mt-1 text-sm text-slate-600">Most members active at {busiestHour.time}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
