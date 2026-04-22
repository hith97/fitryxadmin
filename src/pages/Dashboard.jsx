import React from 'react';
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
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { dashboardOverview } from './Dashboard/dashboardData';

const panelClass =
  'rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]';

const numberFormatter = new Intl.NumberFormat('en-IN');

const toneClasses = {
  emerald: {
    border: 'border-emerald-200',
    accent: 'border-l-4 border-l-emerald-500',
    soft: 'bg-emerald-50 text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700',
    progress: 'bg-emerald-500',
  },
  slate: {
    border: 'border-slate-200',
    accent: 'border-l-4 border-l-slate-400',
    soft: 'bg-slate-100 text-slate-600',
    badge: 'bg-slate-100 text-slate-700',
    progress: 'bg-slate-500',
  },
  blue: {
    border: 'border-blue-200',
    accent: 'border-l-4 border-l-blue-500',
    soft: 'bg-blue-50 text-blue-600',
    badge: 'bg-blue-50 text-blue-700',
    progress: 'bg-blue-500',
  },
  indigo: {
    border: 'border-indigo-200',
    accent: 'border-l-4 border-l-primary',
    soft: 'bg-primary-light text-primary',
    badge: 'bg-primary-light text-primary',
    progress: 'bg-primary',
  },
  violet: {
    border: 'border-violet-200',
    accent: 'border-l-4 border-l-violet-500',
    soft: 'bg-violet-50 text-violet-600',
    badge: 'bg-violet-50 text-violet-700',
    progress: 'bg-violet-500',
  },
  teal: {
    border: 'border-teal-200',
    accent: 'border-l-4 border-l-teal-500',
    soft: 'bg-teal-50 text-teal-600',
    badge: 'bg-teal-50 text-teal-700',
    progress: 'bg-teal-500',
  },
  amber: {
    border: 'border-amber-200',
    accent: 'border-l-4 border-l-amber-500',
    soft: 'bg-amber-50 text-amber-600',
    badge: 'bg-amber-50 text-amber-700',
    progress: 'bg-amber-500',
  },
  rose: {
    border: 'border-rose-200',
    accent: 'border-l-4 border-l-rose-500',
    soft: 'bg-rose-50 text-rose-600',
    badge: 'bg-rose-50 text-rose-700',
    progress: 'bg-rose-500',
  },
};

const iconMap = {
  alert: AlertTriangle,
  calendar: Calendar,
  card: CreditCard,
  check: CheckCircle,
  clock: Clock,
  dumbbell: Dumbbell,
  refresh: RefreshCw,
  revenue: DollarSign,
  trendDown: TrendingDown,
  trendUp: TrendingUp,
  userPlus: UserPlus,
  users: Users,
};

const formatCurrencyTick = (value) => {
  if (value === 0) {
    return '\u20B90';
  }

  return `\u20B9${Math.round(value / 1000)}k`;
};

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const revenue = payload.find((item) => item.dataKey === 'revenue');
  const comparison = payload.find((item) => item.dataKey === 'comparison');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="text-slate-500">Revenue</span>
          <span className="font-semibold text-emerald-600">{`\u20B9${revenue?.value?.toLocaleString?.() ?? 0}`}</span>
        </div>
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="text-slate-500">Comparison</span>
          <span className="font-semibold text-primary">{`\u20B9${comparison?.value?.toLocaleString?.() ?? 0}`}</span>
        </div>
      </div>
    </div>
  );
};

const DistributionTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <div className="text-sm font-semibold text-slate-900">{item?.name}</div>
      <div className="mt-1 text-sm text-slate-500">{`${numberFormatter.format(item?.value ?? 0)} members`}</div>
    </div>
  );
};

const PeakHoursTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="mt-1 text-sm text-slate-500">{`${numberFormatter.format(payload[0]?.value ?? 0)} visits`}</div>
    </div>
  );
};

const HeroStat = ({ item }) => {
  const style = toneClasses[item.tone] || toneClasses.blue;

  return (
    <div className="rounded-[20px] border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
      <div className={`mt-2 text-xl font-bold ${item.tone === 'emerald' ? 'text-emerald-600' : item.tone === 'indigo' ? 'text-primary' : 'text-slate-900'}`}>
        {item.value}
      </div>
      <div className={`mt-3 h-1.5 rounded-full bg-slate-100`}>
        <div className={`h-full w-2/3 rounded-full ${style.progress}`} />
      </div>
    </div>
  );
};

const SnapshotTile = ({ item }) => {
  const style = toneClasses[item.tone] || toneClasses.blue;
  const Icon = iconMap[item.icon] || Activity;

  return (
    <div className="bg-white px-5 py-5 transition-colors duration-200 hover:bg-slate-50/80">
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${style.soft}`}>
        <Icon size={18} />
      </div>
      <div className="text-[1.9rem] font-bold leading-none text-slate-900">{item.value}</div>
      <div className="mt-2 text-sm font-medium text-slate-500">{item.label}</div>
    </div>
  );
};

const KpiCard = ({ item }) => {
  const style = toneClasses[item.tone] || toneClasses.blue;
  const Icon = iconMap[item.icon] || Activity;
  const isPositive = item.changeType !== 'negative';

  return (
    <div className={`${panelClass} ${style.accent} p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)] sm:p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${style.soft}`}>
          <Icon size={20} />
        </div>
        {item.change ? (
          <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{item.change}</span>
          </div>
        ) : null}
        {!item.change && item.badge ? (
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${style.badge}`}>{item.badge}</span>
        ) : null}
      </div>

      <div className="mt-6">
        <div className="text-[2rem] font-bold leading-none text-slate-900">{item.value}</div>
        <div className="mt-2 text-[15px] font-semibold text-slate-700">{item.label}</div>
        <div className="mt-1 text-sm text-slate-500">{item.detail}</div>
      </div>

      {item.progress ? (
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${style.progress}`} style={{ width: `${item.progress}%` }} />
        </div>
      ) : null}
    </div>
  );
};

const AttentionItem = ({ item }) => {
  const style = toneClasses[item.tone] || toneClasses.blue;
  const Icon = iconMap[item.icon] || Activity;

  return (
    <div className={`rounded-[22px] border ${style.border} bg-white p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5`}>
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
          <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-primary">
            {item.action}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const currentDateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
  const ownerFirstName = currentUser?.fullName?.split(' ')[0] || dashboardOverview.welcomeUser;
  const businessName = currentUser?.business?.name || dashboardOverview.businessName;
  const membershipTotal = dashboardOverview.membershipDistribution.reduce((total, item) => total + item.value, 0);
  const busiestHour = dashboardOverview.peakHours.reduce((highest, item) => (item.value > highest.value ? item : highest));
  const averageVisits = Math.round(
    dashboardOverview.peakHours.reduce((total, item) => total + item.value, 0) / dashboardOverview.peakHours.length
  );

  return (
    <div className="mx-auto max-w-[1480px] space-y-6 pb-10">
      <section className={`${panelClass} relative overflow-hidden px-6 py-6 sm:px-7 sm:py-7`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(108,99,255,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(34,197,94,0.12),_transparent_30%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-[620px]">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Activity size={14} />
              Live Operations
            </div>
            <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 sm:text-[2.5rem]">
              Welcome back, {ownerFirstName}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-[15px]">
              Here&apos;s what&apos;s happening at {businessName} today, with a clearer breakdown of revenue,
              traffic, and memberships.
            </p>
          </div>

          <div className="w-full xl:max-w-[560px]">
            <div className="mb-4 flex flex-wrap items-center gap-3 xl:justify-end">
              <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-primary/30 hover:text-primary">
                <Calendar size={16} />
                <span>{dashboardOverview.periodLabel}</span>
                <ChevronDown size={14} />
              </button>
              <Button variant="secondary" className="h-11 w-11 rounded-2xl p-0">
                <RefreshCw size={18} />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {dashboardOverview.heroStats.map((item) => (
                <HeroStat key={item.label} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

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

        <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-6">
          {dashboardOverview.snapshot.map((item) => (
            <SnapshotTile key={item.label} item={item} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {dashboardOverview.kpis.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)]">
        <div className={`${panelClass} p-6 sm:p-7`}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Revenue Overview</h3>
              <div className="mt-2 text-[2rem] font-bold leading-none text-slate-900">
                {dashboardOverview.revenueOverview.total}
              </div>
              <p className="mt-2 text-sm text-slate-500">{dashboardOverview.revenueOverview.subtitle}</p>
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardOverview.revenueOverview.data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 6" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  tickFormatter={formatCurrencyTick}
                  width={52}
                />
                <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#CBD5E1', strokeDasharray: '3 4' }} />
                <Line
                  type="monotone"
                  dataKey="comparison"
                  stroke="#6C63FF"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#6C63FF', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22C55E"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#22C55E', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${panelClass} p-6 sm:p-7`}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Needs Attention</h3>
              <p className="mt-2 text-sm text-slate-500">Priority tasks for the team right now.</p>
            </div>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-600">
              {dashboardOverview.attentionItems.length} open
            </span>
          </div>

          <div className="space-y-4">
            {dashboardOverview.attentionItems.map((item) => (
              <AttentionItem key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">More Insights</h3>
            <p className="text-sm text-slate-500">A deeper look at membership split and daily traffic patterns.</p>
          </div>
          <div className="text-sm font-medium text-slate-400">Updated with the latest dashboard styling</div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className={`${panelClass} p-6 sm:p-7`}>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Membership Distribution</h3>
                <p className="mt-2 text-sm text-slate-500">Breakdown of your active plans across the gym.</p>
              </div>
              <div className="rounded-[20px] bg-slate-50 px-4 py-3 text-right">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Total Members</div>
                <div className="mt-1 text-lg font-bold text-slate-900">{numberFormatter.format(membershipTotal)}</div>
              </div>
            </div>

            <div className="grid items-center gap-8 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
              <div className="relative mx-auto h-[280px] w-full max-w-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardOverview.membershipDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={72}
                      outerRadius={104}
                      paddingAngle={4}
                      cornerRadius={10}
                      stroke="none"
                    >
                      {dashboardOverview.membershipDistribution.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DistributionTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Members</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900">{numberFormatter.format(membershipTotal)}</div>
                </div>
              </div>

              <div className="space-y-4">
                {dashboardOverview.membershipDistribution.map((item) => {
                  const percentage = Math.round((item.value / membershipTotal) * 100);

                  return (
                    <div key={item.name} className="rounded-[20px] border border-slate-100 bg-slate-50/80 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                            <div className="text-sm text-slate-500">{`${percentage}% of active memberships`}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">{numberFormatter.format(item.value)}</div>
                          <div className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">Members</div>
                        </div>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${percentage}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={`${panelClass} p-6 sm:p-7`}>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Peak Hours</h3>
                <p className="mt-2 text-sm text-slate-500">See when your floor is busiest throughout the day.</p>
              </div>
              <div className="rounded-[20px] bg-emerald-50 px-4 py-3 text-right">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-500">Busiest Slot</div>
                <div className="mt-1 text-lg font-bold text-emerald-600">{busiestHour.time}</div>
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardOverview.peakHours} barCategoryGap="24%">
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 6" vertical={false} />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94A3B8' }}
                    dy={8}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <Tooltip content={<PeakHoursTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                  <Bar dataKey="value" radius={[18, 18, 6, 6]} maxBarSize={56}>
                    {dashboardOverview.peakHours.map((item) => (
                      <Cell
                        key={item.time}
                        fill={item.time === busiestHour.time ? '#22C55E' : '#6C63FF'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] bg-slate-50 px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Average Traffic</div>
                <div className="mt-2 text-xl font-bold text-slate-900">{numberFormatter.format(averageVisits)}</div>
                <div className="mt-1 text-sm text-slate-500">Average visits per visible time block</div>
              </div>
              <div className="rounded-[20px] bg-primary-light px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70">Rush Window</div>
                <div className="mt-2 text-xl font-bold text-primary">Evening Focus</div>
                <div className="mt-1 text-sm text-slate-600">Most members are active around {busiestHour.time}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
