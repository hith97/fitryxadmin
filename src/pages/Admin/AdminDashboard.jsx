import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, RefreshCw, ShieldCheck, Target, Users, Package, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../services/adminApi';

const StatCard = ({ icon: Icon, label, value, sub, color = 'indigo', onClick }) => {
  const colors = {
    indigo: 'bg-primary-light text-primary',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    blue: 'bg-blue-50 text-blue-600',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <button onClick={onClick} className={`card border-slate-200 p-6 text-left hover:shadow-md transition-shadow w-full ${onClick ? 'cursor-pointer' : 'cursor-default'}`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div className="mt-4 text-3xl font-bold text-slate-900">{value ?? '—'}</div>
      <div className="mt-1 text-sm font-semibold text-slate-500">{label}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </button>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getStats();
      setStats(res);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <TrendingUp size={14} /> Platform Overview
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">Platform-wide metrics and quick actions.</p>
        </div>
        <button onClick={fetchStats} disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 h-12 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Stat grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={ShieldCheck} label="Total Partners" value={stats?.totalPartners} color="indigo" onClick={() => navigate('/admin/partners')} />
        <StatCard icon={Clock} label="Pending Approvals" value={stats?.pendingPartners} sub="Awaiting review" color="amber" onClick={() => navigate('/admin/partners')} />
        <StatCard icon={ShieldCheck} label="Verified Partners" value={stats?.verifiedPartners} color="emerald" onClick={() => navigate('/admin/partners')} />
        <StatCard icon={Users} label="Total Members" value={stats?.totalMembers} color="blue" onClick={() => navigate('/admin/members')} />
        <StatCard icon={Target} label="Total Leads" value={stats?.totalLeads} color="rose" onClick={() => navigate('/admin/leads')} />
        <StatCard icon={CalendarCheck} label="Total Bookings" value={stats?.totalBookings} color="slate" onClick={() => navigate('/admin/bookings')} />
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid gap-3">
            {[
              { label: 'Review Pending Partners', path: '/admin/partners', icon: ShieldCheck, color: 'text-primary bg-primary-light' },
              { label: 'View All Members', path: '/admin/members', icon: Users, color: 'text-blue-600 bg-blue-50' },
              { label: 'See All Bookings', path: '/admin/bookings', icon: CalendarCheck, color: 'text-slate-600 bg-slate-100' },
              { label: 'Manage Packages', path: '/admin/packages', icon: Package, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'View All Leads', path: '/admin/leads', icon: Target, color: 'text-rose-600 bg-rose-50' },
            ].map(({ label, path, icon: Icon, color }) => (
              <button key={path} onClick={() => navigate(path)}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-200 hover:bg-white transition-colors text-left">
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={15} />
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="card border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Partner Status Breakdown</h2>
          {stats ? (
            <div className="space-y-3">
              {[
                { label: 'Verified', value: stats.verifiedPartners, total: stats.totalPartners, color: 'bg-emerald-500' },
                { label: 'Pending', value: stats.pendingPartners, total: stats.totalPartners, color: 'bg-amber-400' },
                { label: 'Others', value: stats.totalPartners - stats.verifiedPartners - stats.pendingPartners, total: stats.totalPartners, color: 'bg-slate-300' },
              ].map(({ label, value, total, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm font-semibold text-slate-600 mb-1.5">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all`}
                      style={{ width: total ? `${(value / total) * 100}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400">Loading…</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
