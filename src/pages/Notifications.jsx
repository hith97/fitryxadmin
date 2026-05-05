import React, { useState } from 'react';
import {
  Activity,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Clock,
  CreditCard,
  DollarSign,
  UserPlus,
  Users,
  AlertTriangle,
  Dumbbell,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../services/planApi';
import toast from 'react-hot-toast';

// ── Icon/color per notification type ─────────────────────────────
const TYPE_CONFIG = {
  SUBSCRIPTION_EXPIRING: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Expiring Soon' },
  SUBSCRIPTION_EXPIRED:  { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Expired' },
  SUBSCRIPTION_RENEWED:  { icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Renewed' },
  NEW_MEMBER:            { icon: UserPlus, color: 'text-primary', bg: 'bg-primary-light', label: 'New Member' },
  NEW_LEAD:              { icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', label: 'New Lead' },
  LEAD_FOLLOW_UP:        { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Follow-Up Due' },
  ATTENDANCE_CONFIRMED:  { icon: Dumbbell, color: 'text-teal-500', bg: 'bg-teal-50', label: 'Check-In' },
  PAYMENT_RECEIVED:      { icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Payment' },
  GENERAL:               { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-100', label: 'General' },
};

const FILTERS = ['All', 'Unread', 'Expiring', 'Leads', 'Payments'];

function matchesFilter(notif, filter) {
  if (filter === 'Unread') return !notif.isRead;
  if (filter === 'Expiring') return notif.type === 'SUBSCRIPTION_EXPIRING' || notif.type === 'SUBSCRIPTION_EXPIRED';
  if (filter === 'Leads') return notif.type === 'NEW_LEAD' || notif.type === 'LEAD_FOLLOW_UP';
  if (filter === 'Payments') return notif.type === 'PAYMENT_RECEIVED' || notif.type === 'SUBSCRIPTION_RENEWED';
  return true;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Skeleton ──────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />
);

// ── Single notification row ───────────────────────────────────────
const NotifRow = ({ notif, onRead }) => {
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.GENERAL;
  const Icon = cfg.icon;

  return (
    <div
      className={`group flex items-start gap-4 rounded-2xl border p-4 transition-all duration-150 hover:shadow-sm ${
        notif.isRead ? 'border-slate-100 bg-white' : 'border-primary/20 bg-primary/5'
      }`}
    >
      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${cfg.bg}`}>
        <Icon size={18} className={cfg.color} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{notif.title}</span>
              {!notif.isRead && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">{notif.body}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs text-slate-400">{timeAgo(notif.createdAt)}</div>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
        </div>
      </div>
      {!notif.isRead && (
        <button
          onClick={() => onRead(notif.id)}
          className="mt-1 shrink-0 rounded-xl p-1.5 text-slate-300 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
          title="Mark as read"
        >
          <Check size={14} />
        </button>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
const Notifications = () => {
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsApi.list({ page, limit: 30 }),
    keepPreviousData: true,
  });

  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notif-unread'] });
    },
  });

  const markAll = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notif-unread'] });
      toast.success('All notifications marked as read');
    },
  });

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;
  const filtered = notifications.filter((n) => matchesFilter(n, filter));

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-50"
          >
            <CheckCheck size={15} />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              filter === f
                ? 'bg-primary text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 text-center shadow-sm">
          <BellOff size={48} className="text-slate-300" />
          <h3 className="mt-5 text-base font-semibold text-slate-800">
            {filter === 'All' ? 'No notifications yet' : `No ${filter.toLowerCase()} notifications`}
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            {filter === 'All'
              ? "You'll see subscription, lead, and attendance alerts here."
              : 'Try selecting a different filter.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {filtered.map((n) => (
              <NotifRow key={n.id} notif={n} onRead={(id) => markRead.mutate(id)} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-primary/40 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetching}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-primary/40 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Live activity indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <Activity size={12} className="animate-pulse text-primary" />
        Notifications update in real time
      </div>
    </div>
  );
};

export default Notifications;
