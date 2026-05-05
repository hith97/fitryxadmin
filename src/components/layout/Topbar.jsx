import React, { useEffect, useRef, useState } from 'react';
import {
  Bell, BellOff, Check, CheckCheck, ChevronDown, HelpCircle,
  LogOut, Menu, Search, UserCircle2, Building2, Star, Clock,
  AlertTriangle, CreditCard, DollarSign, UserPlus, Users, Dumbbell, Activity,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useBranch } from '../../context/BranchContext';
import { businessApi, notificationsApi } from '../../services/planApi';
import { API_BASE_URL } from '../../config/api';

// ── Notification type config (mirror of Notifications page) ──────
const TYPE_CONFIG = {
  SUBSCRIPTION_EXPIRING: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  SUBSCRIPTION_EXPIRED:  { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50' },
  SUBSCRIPTION_RENEWED:  { icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  NEW_MEMBER:            { icon: UserPlus, color: 'text-primary', bg: 'bg-primary-light' },
  NEW_LEAD:              { icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  LEAD_FOLLOW_UP:        { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
  ATTENDANCE_CONFIRMED:  { icon: Dumbbell, color: 'text-teal-500', bg: 'bg-teal-50' },
  PAYMENT_RECEIVED:      { icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  GENERAL:               { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-100' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Branch Selector ───────────────────────────────────────────────
const BranchSelector = () => {
  const { branches, selectedBranch, switchBranch, isMultiBranch } = useBranch();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!selectedBranch) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 rounded-md cursor-pointer transition-colors border border-transparent hover:border-border group"
      >
        <img src="/favicon.png" alt="" className="h-4 w-4 rounded-sm object-contain" />
        <span className="text-[13px] font-medium text-gray-700 max-w-[120px] truncate">{selectedBranch.name}</span>
        {isMultiBranch && (
          <ChevronDown size={14} className={`text-gray-400 group-hover:text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {open && isMultiBranch && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_8px_30px_rgba(15,23,42,0.12)]">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Switch Branch</div>
          <div className="space-y-0.5">
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => { switchBranch(b.id); setOpen(false); toast.success(`Switched to ${b.name}`); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                  <Building2 size={13} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-gray-900 truncate">{b.name}</span>
                    {b.isMainBranch && <Star size={10} className="text-amber-500 shrink-0" />}
                  </div>
                  {b.city && <div className="text-xs text-gray-400 truncate">{b.city}</div>}
                </div>
                {selectedBranch.id === b.id && <Check size={14} className="text-primary shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Notification Bell + Dropdown ──────────────────────────────────
const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const qc = useQueryClient();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: countData } = useQuery({
    queryKey: ['notif-unread'],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 30_000,
  });

  const { data: listData, isLoading } = useQuery({
    queryKey: ['notif-topbar'],
    queryFn: () => notificationsApi.list({ page: 1, limit: 8 }),
    enabled: open,
    refetchInterval: open ? 30_000 : false,
  });

  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notif-unread'] });
      qc.invalidateQueries({ queryKey: ['notif-topbar'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAll = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notif-unread'] });
      qc.invalidateQueries({ queryKey: ['notif-topbar'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unread = countData?.count ?? 0;
  const notifications = listData?.data ?? [];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[360px] rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <span className="text-sm font-semibold text-slate-900">Notifications</span>
              {unread > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">{unread}</span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[380px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex flex-col gap-2 p-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-3 animate-pulse">
                    <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-100" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 w-3/4 rounded bg-slate-100" />
                      <div className="h-3 w-full rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BellOff size={32} className="text-slate-300" />
                <p className="mt-3 text-xs font-medium text-slate-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.GENERAL;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 rounded-2xl p-3 transition-colors ${
                      n.isRead ? 'hover:bg-slate-50' : 'bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                      <Icon size={15} className={cfg.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900 leading-5">{n.title}</p>
                        <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 leading-5 line-clamp-2">{n.body}</p>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={() => markRead.mutate(n.id)}
                        className="mt-1 shrink-0 rounded-lg p-1 text-slate-300 hover:bg-slate-100 hover:text-primary"
                        title="Mark read"
                      >
                        <Check size={12} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-5 py-3">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <Activity size={14} />
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Topbar ────────────────────────────────────────────────────────
const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { currentUser, logout } = useAuth();
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isPartnerOrManager = currentUser?.role === 'PARTNER' || currentUser?.role === 'BRANCH_MANAGER';

  const { data: business } = useQuery({
    queryKey: ['business-profile'],
    queryFn: businessApi.getProfile,
    enabled: isPartnerOrManager,
    staleTime: 5 * 60 * 1000,
  });

  const displayName = business?.name || currentUser?.fullName || 'Admin User';
  const rawLogoUrl = business?.logoUrl;
  const logoUrl = rawLogoUrl
    ? rawLogoUrl.startsWith('http') ? rawLogoUrl : `${API_BASE_URL}${rawLogoUrl}`
    : null;

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setIsMenuOpen(false);
    queryClient.clear();
    logout();
    toast.success('Logged out successfully.');
    navigate('/login', { replace: true });
  };

  return (
    <header className="fixed top-0 right-0 h-14 bg-white border-b border-border z-30 flex items-center justify-between px-4 lg:left-[220px] left-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-md text-gray-600">
          <Menu size={20} />
        </button>

        {isPartnerOrManager ? (
          <BranchSelector />
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md">
            <img src="/favicon.png" alt="" className="h-4 w-4 rounded-sm object-contain" />
            <span className="text-[13px] font-medium text-gray-700">Fitryx Platform</span>
          </div>
        )}
      </div>

      <div className="flex-1 max-w-xl mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search members, plans..."
            className="w-full bg-gray-50 border-none rounded-lg pl-10 pr-4 py-2 text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors hidden sm:flex items-center gap-1.5">
          <HelpCircle size={18} />
          <span className="text-[13px] font-medium">Help</span>
        </button>

        <NotificationBell />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            className="flex items-center gap-3 rounded-2xl border-l border-border pl-3 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-semibold text-gray-900 leading-tight">{displayName}</div>
              <div className="text-[11px] text-gray-400 font-medium">{currentUser?.role || 'Owner'}</div>
            </div>
            <Avatar name={displayName} src={logoUrl} size="sm" />
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] w-64 rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
              <div className="rounded-[20px] bg-slate-50 px-4 py-4">
                <div className="text-sm font-semibold text-slate-900">{displayName}</div>
                <div className="mt-1 text-sm text-slate-500">{currentUser?.email || currentUser?.phone || 'owner@fitryx.com'}</div>
                {currentUser?.role === 'BRANCH_MANAGER' && selectedBranch && (
                  <div className="mt-2 text-xs text-slate-500">
                    Managing: <span className="font-semibold text-slate-700">{selectedBranch.name}</span>
                  </div>
                )}
                <div className="mt-2 inline-flex rounded-full bg-primary-light px-3 py-1 text-[11px] font-semibold text-primary">
                  {currentUser?.role === 'BRANCH_MANAGER' ? 'Branch Manager' : currentUser?.approvalStatus === 'approved' ? 'Approved' : 'Pending approval'}
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <button
                  type="button"
                  onClick={() => { setIsMenuOpen(false); navigate('/settings/profile'); }}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <UserCircle2 size={18} />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
