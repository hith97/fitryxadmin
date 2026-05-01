import React, { useState } from 'react';
import {
  Plus, Search, Pencil, Trash2, BarChart3, X, CheckCircle2,
  Wallet, TrendingDown, Clock, Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { expenseApi } from '../services/planApi';

// ── Constants ──────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'RENT_FACILITY', label: 'Rent / Facility' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'STAFF_SALARIES', label: 'Staff Salaries' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'OFFICE_ADMIN', label: 'Office & Admin' },
  { value: 'CONSUMABLES', label: 'Consumables' },
  { value: 'TRANSPORT_TRAVEL', label: 'Transport & Travel' },
  { value: 'OTHER', label: 'Other' },
];

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CARD', label: 'Card' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OTHER', label: 'Other' },
];

const CATEGORY_COLORS = {
  UTILITIES: 'bg-blue-50 text-blue-700',
  RENT_FACILITY: 'bg-purple-50 text-purple-700',
  EQUIPMENT: 'bg-orange-50 text-orange-700',
  STAFF_SALARIES: 'bg-cyan-50 text-cyan-700',
  MARKETING: 'bg-pink-50 text-pink-700',
  OFFICE_ADMIN: 'bg-slate-100 text-slate-600',
  CONSUMABLES: 'bg-lime-50 text-lime-700',
  TRANSPORT_TRAVEL: 'bg-amber-50 text-amber-700',
  OTHER: 'bg-slate-100 text-slate-600',
};

const inputCls = (err) =>
  `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
    err ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50 focus:border-primary focus:bg-white'
  }`;

const FormField = ({ label, required, error, children }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}{required && <span className="ml-1 text-rose-500">*</span>}
    </label>
    {children}
    {error && <div className="mt-1.5 text-xs text-rose-600">{error}</div>}
  </div>
);

// ── Expense Form Modal ─────────────────────────────────────────
const EMPTY = {
  title: '', description: '', amount: '', expenseDate: new Date().toISOString().split('T')[0],
  category: '', customCategory: '', paymentMethod: 'CASH', status: 'PAID',
  vendorName: '', invoiceNumber: '',
};

const ExpenseModal = ({ isOpen, onClose, expense, onSaved }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(expense);

  React.useEffect(() => {
    if (isOpen) {
      setErrors({});
      setForm(expense ? {
        title: expense.title || '',
        description: expense.description || '',
        amount: expense.amount ?? '',
        expenseDate: expense.expenseDate ? expense.expenseDate.split('T')[0] : new Date().toISOString().split('T')[0],
        category: expense.category || '',
        customCategory: expense.customCategory || '',
        paymentMethod: expense.paymentMethod || 'CASH',
        status: expense.status || 'PAID',
        vendorName: expense.vendorName || '',
        invoiceNumber: expense.invoiceNumber || '',
      } : EMPTY);
    }
  }, [isOpen, expense]);

  const set = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    setErrors((e) => ({ ...e, [f]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount.';
    if (!form.expenseDate) e.expenseDate = 'Date is required.';
    if (!form.category) e.category = 'Select a category.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (payload) => isEdit ? expenseApi.update(expense.id, payload) : expenseApi.create(payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Expense updated.' : 'Expense added.');
      onSaved?.();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      amount: Number(form.amount),
      expenseDate: form.expenseDate,
      category: form.category,
      customCategory: form.category === 'OTHER' ? form.customCategory : undefined,
      paymentMethod: form.paymentMethod,
      status: form.status,
      vendorName: form.vendorName.trim() || undefined,
      invoiceNumber: form.invoiceNumber.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Expense' : 'Add Expense'}
      width="640px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            <CheckCircle2 size={15} />
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Expense' : 'Add Expense'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Title" required error={errors.title}>
            <input value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Electricity bill" className={inputCls(errors.title)} />
          </FormField>
          <FormField label="Amount (₹)" required error={errors.amount}>
            <input type="number" min="0" value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              placeholder="e.g. 5000" className={inputCls(errors.amount)} />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Date" required error={errors.expenseDate}>
            <input type="date" value={form.expenseDate}
              onChange={(e) => set('expenseDate', e.target.value)} className={inputCls(errors.expenseDate)} />
          </FormField>
          <FormField label="Category" required error={errors.category}>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls(errors.category)}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormField>
        </div>

        {form.category === 'OTHER' && (
          <FormField label="Custom Category">
            <input value={form.customCategory} onChange={(e) => set('customCategory', e.target.value)}
              placeholder="e.g. Insurance" className={inputCls(false)} />
          </FormField>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Payment Method">
            <select value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)} className={inputCls(false)}>
              {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </FormField>
          <FormField label="Status">
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls(false)}>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
            </select>
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Vendor Name">
            <input value={form.vendorName} onChange={(e) => set('vendorName', e.target.value)}
              placeholder="e.g. MSEB" className={inputCls(false)} />
          </FormField>
          <FormField label="Invoice / Reference No.">
            <input value={form.invoiceNumber} onChange={(e) => set('invoiceNumber', e.target.value)}
              placeholder="e.g. INV-2024" className={inputCls(false)} />
          </FormField>
        </div>

        <FormField label="Description">
          <textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)}
            placeholder="Optional notes..." className={`${inputCls(false)} resize-none`} />
        </FormField>
      </div>
    </Modal>
  );
};

// ── Main Page ──────────────────────────────────────────────────
const Expenses = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  const now = new Date();
  const { data: reportData } = useQuery({
    queryKey: ['expense-report', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => expenseApi.monthlyReport(now.getFullYear(), now.getMonth() + 1),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', { status: filterStatus, category: filterCategory, page }],
    queryFn: () => expenseApi.list({ status: filterStatus || undefined, category: filterCategory || undefined, page, limit: 20 }),
    keepPreviousData: true,
  });

  const expenses = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, totalPages: 1 };

  const filtered = search
    ? expenses.filter((e) =>
        `${e.title} ${e.vendorName} ${e.category}`.toLowerCase().includes(search.toLowerCase())
      )
    : expenses;

  const deleteMutation = useMutation({
    mutationFn: (id) => expenseApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-report'] });
      toast.success('Expense deleted.');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDelete = (e) => {
    if (window.confirm(`Delete expense "${e.title}"?`)) deleteMutation.mutate(e.id);
  };

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['expense-report'] });
  };

  const report = reportData ?? { totalExpenses: 0, paid: 0, pending: 0, count: 0 };

  return (
    <div className="max-w-[1200px] mx-auto pb-12 space-y-8">
      <ExpenseModal
        isOpen={addOpen || Boolean(editExpense)}
        onClose={() => { setAddOpen(false); setEditExpense(null); }}
        expense={editExpense}
        onSaved={handleSaved}
      />

      {/* Header */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Expenses
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">Expense Manager</h1>
          <p className="mt-2 text-sm text-slate-500">Track, categorize, and analyze your business expenses.</p>
        </div>
        <Button className="h-12 rounded-2xl px-5" onClick={() => setAddOpen(true)}>
          <Plus size={18} /> Add Expense
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'This Month', value: `₹${Math.round(report.totalExpenses).toLocaleString()}`, icon: TrendingDown, cls: 'text-rose-600 bg-rose-50' },
          { label: 'Paid', value: `₹${Math.round(report.paid).toLocaleString()}`, icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50' },
          { label: 'Pending', value: `₹${Math.round(report.pending).toLocaleString()}`, icon: Clock, cls: 'text-amber-600 bg-amber-50' },
          { label: 'Entries', value: report.count, icon: Wallet, cls: 'text-primary bg-primary-light' },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="card border-slate-200 p-5">
            <div className={`inline-flex rounded-xl p-2 ${cls} mb-3`}>
              <Icon size={18} className={cls.split(' ')[0]} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="mt-1 text-xs font-medium text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      {reportData?.byCategory && Object.keys(reportData.byCategory).length > 0 && (
        <div className="card border-slate-200 p-5">
          <div className="text-sm font-bold text-slate-700 mb-4">Breakdown by Category (This Month)</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(reportData.byCategory).map(([cat, amt]) => {
              const cfg = CATEGORIES.find((c) => c.value === cat);
              return (
                <div key={cat} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${CATEGORY_COLORS[cat] || 'bg-slate-100 text-slate-600'}`}>
                  {cfg?.label || cat}
                  <span className="font-bold">₹{Math.round(amt).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card border-slate-200 p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, vendor, category..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white" />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary">
          <option value="">All Status</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
        </select>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading expenses...</div>
      ) : filtered.length === 0 ? (
        <div className="card border-slate-200 p-16 flex flex-col items-center text-center">
          <TrendingDown size={40} className="text-slate-200 mb-4" />
          <div className="text-lg font-semibold text-slate-700">No expenses found</div>
          <div className="mt-2 text-sm text-slate-400 mb-6">Start tracking your business expenses.</div>
          <Button onClick={() => setAddOpen(true)}><Plus size={16} /> Add Expense</Button>
        </div>
      ) : (
        <div className="card border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {['Title', 'Category', 'Date', 'Vendor', 'Method', 'Status', 'Amount', ''].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((exp) => {
                  const catCfg = CATEGORIES.find((c) => c.value === exp.category);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{exp.title}</div>
                        {exp.description && <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{exp.description}</div>}
                        {exp.invoiceNumber && <div className="text-[10px] text-slate-300">Ref: {exp.invoiceNumber}</div>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${CATEGORY_COLORS[exp.category] || 'bg-slate-100 text-slate-600'}`}>
                          {catCfg?.label || exp.category}
                          {exp.category === 'OTHER' && exp.customCategory ? ` · ${exp.customCategory}` : ''}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-slate-500">
                        {exp.expenseDate ? format(new Date(exp.expenseDate), 'dd MMM yyyy') : '—'}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-slate-500">{exp.vendorName || '—'}</td>
                      <td className="px-5 py-4 text-[12px] text-slate-500 capitalize">{exp.paymentMethod?.toLowerCase().replace('_', ' ') || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          exp.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {exp.status === 'PAID' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-[13px] text-slate-900">₹{exp.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditExpense(exp)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(exp)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-sm text-slate-500">
            <span>Showing <strong className="text-slate-800">{filtered.length}</strong> of <strong className="text-slate-800">{meta.total}</strong> expenses</span>
            {meta.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                  className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-white">Prev</button>
                <span className="text-xs font-semibold">{page} / {meta.totalPages}</span>
                <button disabled={page === meta.totalPages} onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-white">Next</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
