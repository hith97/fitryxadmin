import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Dumbbell,
  Users, BarChart3, Calendar,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { incomeApi } from '../services/planApi';

const MonthBar = ({ value, max, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <div className="w-full h-32 bg-slate-100 rounded-xl relative flex items-end overflow-hidden">
        <div className={`w-full ${color} rounded-xl transition-all duration-500`} style={{ height: `${Math.max(pct, 2)}%` }} />
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, trend, color }) => (
  <div className="card border-slate-200 p-5 space-y-3">
    <div className={`inline-flex rounded-xl p-2 ${color}`}>
      <Icon size={18} />
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs font-medium text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  </div>
);

const Income = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['income-summary', applied],
    queryFn: () => incomeApi.summary({ from: applied.from || undefined, to: applied.to || undefined }),
  });

  const applyFilter = () => { setApplied({ from, to }); };
  const clearFilter = () => { setFrom(''); setTo(''); setApplied({}); };

  const summary = data ?? {};
  const chart = summary.monthlyChart ?? [];

  const maxRevenue = Math.max(...chart.map((m) => m.membership + m.products), 1);
  const maxExpense = Math.max(...chart.map((m) => m.expenses), 1);
  const maxAll = Math.max(maxRevenue, maxExpense, 1);

  const fmt = (n) => `₹${(n ?? 0).toLocaleString()}`;

  return (
    <div className="max-w-[1200px] mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Income
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">Income Overview</h1>
          <p className="mt-2 text-sm text-slate-500">
            Revenue from memberships, PT, and product sales — minus expenses.
          </p>
        </div>

        {/* Date filter */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white" />
          </div>
          <button onClick={applyFilter}
            className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            Apply
          </button>
          {(applied.from || applied.to) && (
            <button onClick={clearFilter}
              className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading income data...</div>
      ) : (
        <>
          {/* Key stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Total Revenue" value={fmt(summary.totalRevenue)} icon={TrendingUp}
              color="text-primary bg-primary-light" />
            <StatCard label="Membership Revenue" value={fmt(summary.membershipRevenue)}
              sub={`${summary.subscriptionCount ?? 0} subs`} icon={Users}
              color="text-cyan-600 bg-cyan-50" />
            <StatCard label="PT Revenue" value={fmt(summary.ptRevenue)} icon={Dumbbell}
              color="text-violet-600 bg-violet-50" />
            <StatCard label="Product Sales" value={fmt(summary.productRevenue)}
              sub={`${summary.orderCount ?? 0} orders`} icon={ShoppingBag}
              color="text-orange-600 bg-orange-50" />
            <StatCard label="Total Expenses" value={fmt(summary.totalExpenses)} icon={TrendingDown}
              color="text-rose-600 bg-rose-50" />
            <div className={`card border p-5 space-y-3 ${summary.netProfit >= 0 ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'}`}>
              <div className={`inline-flex rounded-xl p-2 ${summary.netProfit >= 0 ? 'text-emerald-600 bg-emerald-100' : 'text-rose-600 bg-rose-100'}`}>
                <DollarSign size={18} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {fmt(summary.netProfit)}
                </div>
                <div className="text-xs font-medium text-slate-400 mt-0.5">Net Profit</div>
              </div>
            </div>
          </div>

          {/* Revenue split */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="card border-slate-200 p-5 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">Monthly Revenue vs Expenses (Last 6 Months)</span>
              </div>

              {chart.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">No data available.</div>
              ) : (
                <div className="space-y-3">
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 text-xs font-semibold mb-2">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-primary inline-block" />Membership</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-orange-400 inline-block" />Products</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-rose-400 inline-block" />Expenses</span>
                  </div>

                  {chart.map((m) => {
                    const membership = m.membership + m.products;
                    const memPct = maxAll > 0 ? (m.membership / maxAll) * 100 : 0;
                    const prodPct = maxAll > 0 ? (m.products / maxAll) * 100 : 0;
                    const expPct = maxAll > 0 ? (m.expenses / maxAll) * 100 : 0;
                    const [yr, mo] = m.month.split('-');
                    const monthLabel = new Date(Number(yr), Number(mo) - 1).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
                    return (
                      <div key={m.month} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-0.5">
                          <span className="w-16 font-semibold">{monthLabel}</span>
                          <span className="text-slate-400">{fmt(membership)} rev · {fmt(m.expenses)} exp</span>
                          <span className={`font-bold ${m.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            Net: {fmt(m.net)}
                          </span>
                        </div>
                        {/* Membership bar */}
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-[10px] text-slate-400">Mem.</span>
                          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${memPct}%` }} />
                          </div>
                          <span className="w-20 text-right text-[10px] text-slate-500">{fmt(m.membership)}</span>
                        </div>
                        {/* Products bar */}
                        {m.products > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-[10px] text-slate-400">Prod.</span>
                            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${prodPct}%` }} />
                            </div>
                            <span className="w-20 text-right text-[10px] text-slate-500">{fmt(m.products)}</span>
                          </div>
                        )}
                        {/* Expenses bar */}
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-[10px] text-slate-400">Exp.</span>
                          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-400 rounded-full transition-all" style={{ width: `${expPct}%` }} />
                          </div>
                          <span className="w-20 text-right text-[10px] text-slate-500">{fmt(m.expenses)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Revenue breakdown */}
            <div className="card border-slate-200 p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">Revenue Breakdown</span>
              </div>

              {[
                { label: 'Membership Revenue', value: summary.membershipRevenue ?? 0, total: summary.totalRevenue ?? 1, color: 'bg-primary' },
                { label: 'PT Revenue', value: summary.ptRevenue ?? 0, total: summary.totalRevenue ?? 1, color: 'bg-violet-500' },
                { label: 'Product Revenue', value: summary.productRevenue ?? 0, total: summary.totalRevenue ?? 1, color: 'bg-orange-400' },
              ].map(({ label, value, total, color }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{label}</span>
                      <span className="font-bold text-slate-900">{fmt(value)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] text-slate-400">{pct}% of total revenue</div>
                  </div>
                );
              })}

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Revenue</span>
                  <span className="font-bold text-slate-900">{fmt(summary.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Expenses</span>
                  <span className="font-bold text-rose-600">{fmt(summary.totalExpenses)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base">
                  <span className="font-bold text-slate-900">Net Profit</span>
                  <span className={`font-bold ${(summary.netProfit ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {fmt(summary.netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Income;
