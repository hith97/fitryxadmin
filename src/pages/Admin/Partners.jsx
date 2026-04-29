import React, { useEffect, useMemo, useState } from 'react';
import { Eye, PauseCircle, Pencil, RefreshCw, Search, ShieldCheck, Trash2, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { adminApi } from '../../services/adminApi';
import {
  getBusinessName, getCategory, getEmail, getOwnerName,
  getPartnerId, getPhone, getStatus, normalizePartnerList,
} from './partnerUtils';

const STATUS_STYLES = {
  PENDING:   'border-amber-200 bg-amber-50 text-amber-700',
  VERIFIED:  'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED:  'border-rose-200 bg-rose-50 text-rose-700',
  SUSPENDED: 'border-slate-200 bg-slate-100 text-slate-600',
  PAUSED:    'border-orange-200 bg-orange-50 text-orange-700',
};

export const PartnerStatusBadge = ({ status }) => (
  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[status] || STATUS_STYLES.PENDING}`}>
    {status}
  </span>
);

const ALL_STATUSES = ['', 'PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'PAUSED'];

const Partners = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState('');

  useEffect(() => {
    adminApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const payload = await adminApi.getPartners({ status, categoryId, page, limit: 15 });
      const normalized = normalizePartnerList(payload);
      setPartners(normalized.partners);
      setTotal(normalized.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, [status, categoryId, page]); // eslint-disable-line

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter((p) =>
      `${getBusinessName(p)} ${getOwnerName(p)} ${getEmail(p)} ${getPhone(p)} ${getCategory(p)}`.toLowerCase().includes(q)
    );
  }, [partners, search]);

  const runAction = async (partner, action) => {
    const id = getPartnerId(partner);
    if (!id) return toast.error('Missing partner id.');
    if (!window.confirm(`${action} ${getBusinessName(partner)}?`)) return;
    setActionId(`${action}-${id}`);
    try {
      if (action === 'approve') await adminApi.approvePartner(id);
      else if (action === 'reject') await adminApi.rejectPartner(id, 'Rejected by admin');
      else if (action === 'suspend') await adminApi.suspendPartner(id);
      else if (action === 'pause') await adminApi.pausePartner(id);
      else if (action === 'delete') await adminApi.deletePartner(id);
      toast.success(`Partner ${action}d.`);
      fetchPartners();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionId('');
    }
  };

  const columns = [
    {
      header: 'Business',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{getBusinessName(row)}</div>
          <div className="text-[12px] text-slate-400">{getCategory(row)}</div>
        </div>
      ),
    },
    {
      header: 'Owner',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-700">{getOwnerName(row)}</div>
          <div className="text-[12px] text-slate-400">{getEmail(row)}</div>
        </div>
      ),
    },
    { header: 'Phone', render: (row) => getPhone(row) },
    { header: 'Status', render: (row) => <PartnerStatusBadge status={getStatus(row)} /> },
    {
      header: 'Actions',
      render: (row) => {
        const id = getPartnerId(row);
        const s = getStatus(row);
        return (
          <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => navigate(`/admin/partners/${id}`)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary">
              <Eye size={13} /> View
            </button>
            <button onClick={() => navigate(`/admin/partners/${id}?edit=1`)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-indigo-400 hover:text-indigo-600">
              <Pencil size={13} /> Edit
            </button>
            {s === 'PENDING' && (
              <>
                <button disabled={actionId === `approve-${id}`} onClick={() => runAction(row, 'approve')} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                  <UserCheck size={13} /> Approve
                </button>
                <button disabled={actionId === `reject-${id}`} onClick={() => runAction(row, 'reject')} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
                  <UserX size={13} /> Reject
                </button>
              </>
            )}
            {s === 'VERIFIED' && (
              <>
                <button disabled={actionId === `suspend-${id}`} onClick={() => runAction(row, 'suspend')} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                  Suspend
                </button>
                <button disabled={actionId === `pause-${id}`} onClick={() => runAction(row, 'pause')} className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100">
                  <PauseCircle size={13} /> Pause
                </button>
              </>
            )}
            {(s === 'SUSPENDED' || s === 'PAUSED') && (
              <button disabled={actionId === `delete-${id}`} onClick={() => runAction(row, 'delete')} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
                <Trash2 size={13} /> Delete
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <ShieldCheck size={14} /> Partner Management
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">Business Partners</h1>
          <p className="mt-2 text-sm text-slate-500">Review, approve, suspend, pause or delete partner businesses.</p>
        </div>
        <Button variant="secondary" className="h-12 rounded-2xl px-5" onClick={fetchPartners} disabled={loading}>
          <RefreshCw size={18} /> {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <div className="card p-5 border-slate-200">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_220px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search business, owner, phone…"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white" />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary">
            <option value="">All statuses</option>
            {ALL_STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden border-slate-200">
        {loading
          ? <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading partners…</div>
          : filtered.length === 0
            ? <div className="p-8 text-center text-sm text-slate-400">No partners found.</div>
            : <Table columns={columns} data={filtered} onRowClick={(row) => navigate(`/admin/partners/${getPartnerId(row)}`)} />}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="secondary" disabled={page === 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
        <span className="text-sm font-semibold text-slate-500">Page {page} · {total} total</span>
        <Button variant="secondary" disabled={filtered.length < 15 || loading} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
};

export default Partners;
