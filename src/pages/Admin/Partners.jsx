import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Filter, RefreshCw, Search, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { businessCategoryGroups } from '../Auth/authData';
import { adminApi } from '../../services/adminApi';
import {
  getBusinessName,
  getCategory,
  getEmail,
  getOwnerName,
  getPartnerId,
  getPhone,
  getStatus,
  normalizePartnerList,
  partnerStatuses,
} from './partnerUtils';

const statusStyles = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  VERIFIED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700',
  SUSPENDED: 'border-slate-200 bg-slate-100 text-slate-600',
};

export const PartnerStatusBadge = ({ status }) => (
  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[status] || statusStyles.PENDING}`}>
    {status}
  </span>
);

const Partners = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('PENDING');
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState('');

  const fetchPartners = async () => {
    setLoading(true);

    try {
      const payload = await adminApi.getPartners({
        status,
        categoryId,
        page,
        limit: 10,
      });
      const normalized = normalizePartnerList(payload);
      setPartners(normalized.partners);
      setTotal(normalized.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Loads the server-side page whenever filters change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, categoryId, page]);

  const filteredPartners = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return partners;
    }

    return partners.filter((partner) =>
      `${getBusinessName(partner)} ${getOwnerName(partner)} ${getEmail(partner)} ${getPhone(partner)} ${getCategory(partner)}`
        .toLowerCase()
        .includes(query)
    );
  }, [partners, search]);

  const runAction = async (partner, action) => {
    const id = getPartnerId(partner);
    const labels = {
      approve: 'approve',
      reject: 'reject',
      suspend: 'suspend',
    };

    if (!id) {
      toast.error('Missing partner id.');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${labels[action]} ${getBusinessName(partner)}?`)) {
      return;
    }

    setActionId(`${action}-${id}`);

    try {
      if (action === 'approve') {
        await adminApi.approvePartner(id);
      } else if (action === 'reject') {
        await adminApi.rejectPartner(id);
      } else {
        await adminApi.suspendPartner(id);
      }

      toast.success(`Partner ${labels[action]}d.`);
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
      accessor: 'businessName',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{getBusinessName(row)}</div>
          <div className="text-[12px] text-slate-400">{getCategory(row)}</div>
        </div>
      ),
    },
    {
      header: 'Owner',
      accessor: 'ownerName',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-700">{getOwnerName(row)}</div>
          <div className="text-[12px] text-slate-400">{getEmail(row)}</div>
        </div>
      ),
    },
    { header: 'Phone', accessor: 'phone', render: (row) => getPhone(row) },
    { header: 'Status', accessor: 'status', render: (row) => <PartnerStatusBadge status={getStatus(row)} /> },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => {
        const id = getPartnerId(row);
        const currentStatus = getStatus(row);

        return (
          <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
            <Button variant="secondary" className="rounded-xl px-3 py-2" onClick={() => navigate(`/admin/partners/${id}`)}>
              <Eye size={14} />
              View
            </Button>
            {currentStatus === 'PENDING' ? (
              <>
                <Button className="rounded-xl px-3 py-2" disabled={actionId === `approve-${id}`} onClick={() => runAction(row, 'approve')}>
                  <UserCheck size={14} />
                  Approve
                </Button>
                <Button variant="danger" className="rounded-xl px-3 py-2" disabled={actionId === `reject-${id}`} onClick={() => runAction(row, 'reject')}>
                  <UserX size={14} />
                  Reject
                </Button>
              </>
            ) : null}
            {currentStatus === 'VERIFIED' ? (
              <Button variant="secondary" className="rounded-xl px-3 py-2" disabled={actionId === `suspend-${id}`} onClick={() => runAction(row, 'suspend')}>
                Suspend
              </Button>
            ) : null}
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
            <ShieldCheck size={14} />
            Partner Approval
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">Business Applications</h1>
          <p className="mt-2 text-sm text-slate-500">Review, approve, reject, or suspend partner businesses.</p>
        </div>
        <Button variant="secondary" className="h-12 rounded-2xl px-5" onClick={fetchPartners} disabled={loading}>
          <RefreshCw size={18} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5 border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Current Result</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{filteredPartners.length}</div>
        </div>
        <div className="card p-5 border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total From API</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{total}</div>
        </div>
        <div className="card p-5 border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status Filter</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{status}</div>
        </div>
      </div>

      <div className="card p-5 border-slate-200">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px_220px_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search business, owner, email, phone..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
            />
          </div>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white"
          >
            {partnerStatuses.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white"
          >
            <option value="">All categories</option>
            {businessCategoryGroups.map((category) => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>
          <Button variant="secondary" className="rounded-2xl px-4 py-3">
            <Filter size={16} />
            Filters
          </Button>
        </div>
      </div>

      <div className="card overflow-hidden border-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        {loading ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading partners...</div>
        ) : (
          <Table columns={columns} data={filteredPartners} onRowClick={(row) => navigate(`/admin/partners/${getPartnerId(row)}`)} />
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="secondary" disabled={page === 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>
          Previous
        </Button>
        <div className="text-sm font-semibold text-slate-500">Page {page}</div>
        <Button variant="secondary" disabled={filteredPartners.length < 10 || loading} onClick={() => setPage((current) => current + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default Partners;
