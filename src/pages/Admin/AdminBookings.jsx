import React, { useEffect, useState } from 'react';
import { CalendarCheck, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { adminApi } from '../../services/adminApi';
import { format } from 'date-fns';

const STATUS_STYLES = {
  PENDING:   'border-amber-200 bg-amber-50 text-amber-700',
  CONFIRMED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  CANCELLED: 'border-rose-200 bg-rose-50 text-rose-700',
  COMPLETED: 'border-slate-200 bg-slate-100 text-slate-600',
};

const BookingBadge = ({ status }) => (
  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[status] || STATUS_STYLES.PENDING}`}>
    {status}
  </span>
);

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const LIMIT = 20;

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllBookings({ status, page, limit: LIMIT });
      setBookings(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [status, page]); // eslint-disable-line

  const columns = [
    {
      header: 'Business',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.business?.name || '—'}</div>
          <div className="text-[12px] text-slate-400">{row.business?.category?.name || '—'}</div>
        </div>
      ),
    },
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-700">{row.user?.email || '—'}</div>
          <div className="text-[12px] text-slate-400">{row.user?.phone || '—'}</div>
        </div>
      ),
    },
    {
      header: 'Date & Time',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-700">{row.slotDate ? format(new Date(row.slotDate), 'dd MMM yyyy') : '—'}</div>
          <div className="text-[12px] text-slate-400">{row.startTime} – {row.endTime}</div>
        </div>
      ),
    },
    { header: 'Amount', render: (row) => row.price ? `₹${row.price}` : '—' },
    { header: 'Status', render: (row) => <BookingBadge status={row.status} /> },
    { header: 'Booked On', render: (row) => row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy') : '—' },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <CalendarCheck size={14} /> Bookings
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">All Bookings</h1>
          <p className="mt-2 text-sm text-slate-500">Hourly slot bookings across all sports & activity venues.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">{total} total</span>
          <Button variant="secondary" className="h-12 rounded-2xl px-5" onClick={fetchBookings} disabled={loading}>
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
          ? <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading bookings…</div>
          : bookings.length === 0
            ? <div className="p-8 text-center text-sm text-slate-400">No bookings found.</div>
            : <Table columns={columns} data={bookings} />}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="secondary" disabled={page === 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
        <span className="text-sm font-semibold text-slate-500">Page {page}</span>
        <Button variant="secondary" disabled={bookings.length < LIMIT || loading} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
};

export default AdminBookings;
