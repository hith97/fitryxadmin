import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { adminApi } from '../../services/adminApi';
import { format } from 'date-fns';

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const LIMIT = 20;

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllMembers({ search, page, limit: LIMIT });
      setMembers(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, [search, page]); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const columns = [
    {
      header: 'Member',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.fullName}</div>
          <div className="text-[12px] text-slate-400">{row.email || '—'}</div>
        </div>
      ),
    },
    { header: 'Phone', render: (row) => row.phone || '—' },
    {
      header: 'Business',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-700">{row.business?.name || '—'}</div>
          <div className="text-[12px] text-slate-400">{row.business?.category?.name || '—'}</div>
        </div>
      ),
    },
    {
      header: 'Active Plan',
      render: (row) => row.subscriptions?.length
        ? <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Active</span>
        : <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500">No plan</span>,
    },
    {
      header: 'Joined',
      render: (row) => row.joiningDate ? format(new Date(row.joiningDate), 'dd MMM yyyy') : '—',
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Users size={14} /> All Members
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">Members</h1>
          <p className="mt-2 text-sm text-slate-500">All members across every business on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">{total} total</span>
          <Button variant="secondary" className="h-12 rounded-2xl px-5" onClick={fetchMembers} disabled={loading}>
            <RefreshCw size={18} /> Refresh
          </Button>
        </div>
      </div>

      <div className="card p-5 border-slate-200">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, phone, email…"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white" />
          </div>
          <Button type="submit" className="rounded-2xl px-6">Search</Button>
        </form>
      </div>

      <div className="card overflow-hidden border-slate-200">
        {loading
          ? <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading members…</div>
          : members.length === 0
            ? <div className="p-8 text-center text-sm text-slate-400">No members found.</div>
            : <Table columns={columns} data={members} />}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="secondary" disabled={page === 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
        <span className="text-sm font-semibold text-slate-500">Page {page}</span>
        <Button variant="secondary" disabled={members.length < LIMIT || loading} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
};

export default AdminMembers;
