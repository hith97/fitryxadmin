import React, { useEffect, useState } from 'react';
import { RefreshCw, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { adminApi } from '../../services/adminApi';
import { format } from 'date-fns';

const STATUS_STYLES = {
  NEW:       'border-blue-200 bg-blue-50 text-blue-700',
  CONTACTED: 'border-amber-200 bg-amber-50 text-amber-700',
  CONVERTED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  LOST:      'border-slate-200 bg-slate-100 text-slate-600',
};

const LeadBadge = ({ status }) => (
  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[status] || STATUS_STYLES.NEW}`}>
    {status}
  </span>
);

const STATUSES = ['', 'NEW', 'CONTACTED', 'CONVERTED', 'LOST'];

const AdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const LIMIT = 20;

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getLeads({ status, page, limit: LIMIT });
      setLeads(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [status, page]); // eslint-disable-line

  const columns = [
    {
      header: 'Lead',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.fullName}</div>
          <div className="text-[12px] text-slate-400">{row.email || '—'}</div>
        </div>
      ),
    },
    { header: 'Phone', render: (row) => row.phone },
    {
      header: 'Business',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-700">{row.business?.name || '—'}</div>
          <div className="text-[12px] text-slate-400">{row.business?.category?.name || '—'} · {row.business?.city || '—'}</div>
        </div>
      ),
    },
    { header: 'Source', render: (row) => <span className="text-sm text-slate-600">{row.source}</span> },
    { header: 'Status', render: (row) => <LeadBadge status={row.status} /> },
    { header: 'Date', render: (row) => format(new Date(row.createdAt), 'dd MMM yyyy') },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Target size={14} /> Leads
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">All Leads</h1>
          <p className="mt-2 text-sm text-slate-500">Platform-wide leads — Sports bookings are tracked separately.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">{total} total</span>
          <Button variant="secondary" className="h-12 rounded-2xl px-5" onClick={fetchLeads} disabled={loading}>
            <RefreshCw size={18} /> Refresh
          </Button>
        </div>
      </div>

      <div className="card p-5 border-slate-200">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary w-48">
          <option value="">All statuses</option>
          {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden border-slate-200">
        {loading
          ? <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading leads…</div>
          : leads.length === 0
            ? <div className="p-8 text-center text-sm text-slate-400">No leads found.</div>
            : <Table columns={columns} data={leads} />}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="secondary" disabled={page === 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
        <span className="text-sm font-semibold text-slate-500">Page {page}</span>
        <Button variant="secondary" disabled={leads.length < LIMIT || loading} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
};

export default AdminLeads;
