import React, { useState } from 'react';
import {
  CalendarClock,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { leadApi } from '../services/planApi';

// ── Constants ──────────────────────────────────────────────────
const SOURCES = ['WALKIN', 'SOCIAL_MEDIA', 'REFERRAL', 'WEBSITE', 'OTHER'];
const SOURCE_LABELS = {
  WALKIN: 'Walk-in', SOCIAL_MEDIA: 'Social Media',
  REFERRAL: 'Referral', WEBSITE: 'Website', OTHER: 'Other',
};

const STATUS_CFG = {
  NEW:       { label: 'New',       cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  CONTACTED: { label: 'Contacted', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONVERTED: { label: 'Converted', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  LOST:      { label: 'Lost',      cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.NEW;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

// ── Form helpers ───────────────────────────────────────────────
const inputCls = (err) =>
  `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
    err
      ? 'border-rose-300 bg-rose-50'
      : 'border-slate-200 bg-slate-50 focus:border-primary focus:bg-white'
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

const EMPTY_FORM = {
  fullName: '', phone: '', email: '', source: 'WALKIN',
  notes: '', followUpDate: new Date().toISOString().split('T')[0],
};

// ── Lead Form Modal ────────────────────────────────────────────
const LeadFormModal = ({ isOpen, onClose, lead = null, onSaved }) => {
  const isEdit = Boolean(lead);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (isOpen) {
      setErrors({});
      setForm(lead ? {
        fullName: lead.fullName ?? '',
        phone: lead.phone ?? '',
        email: lead.email ?? '',
        source: lead.source ?? 'WALKIN',
        notes: lead.notes ?? '',
        followUpDate: lead.followUpDate
          ? lead.followUpDate.split('T')[0]
          : new Date().toISOString().split('T')[0],
      } : EMPTY_FORM);
    }
  }, [isOpen, lead]);

  const set = (f, v) => {
    setForm((prev) => ({ ...prev, [f]: v }));
    setErrors((e) => ({ ...e, [f]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required.';
    if (!form.phone.trim()) e.phone = 'Phone is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? leadApi.update(lead.id, payload) : leadApi.create(payload),
    onSuccess: () => {
      toast.success(`Lead ${isEdit ? 'updated' : 'added'}.`);
      onSaved?.();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      source: form.source,
      notes: form.notes.trim() || undefined,
      followUpDate: form.followUpDate || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Lead' : 'Add Lead'}
      width="600px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Lead' : 'Add Lead'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Full Name" required error={errors.fullName} >
          <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)}
            placeholder="e.g. Amit Patel" className={inputCls(errors.fullName)} />
        </FormField>

        <FormField label="Phone" required error={errors.phone}>
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
            placeholder="+91 9876543210" className={inputCls(errors.phone)} />
        </FormField>

        <FormField label="Email">
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
            placeholder="amit@example.com" className={inputCls(false)} />
        </FormField>

        <FormField label="Source">
          <select value={form.source} onChange={(e) => set('source', e.target.value)} className={inputCls(false)}>
            {SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
          </select>
        </FormField>

        <FormField label="Follow-up Date">
          <input type="date" value={form.followUpDate} onChange={(e) => set('followUpDate', e.target.value)}
            className={inputCls(false)} />
        </FormField>

        {isEdit && (
          <FormField label="Status">
            <select value={form.status ?? lead?.status ?? 'NEW'}
              onChange={(e) => set('status', e.target.value)} className={inputCls(false)}>
              {Object.entries(STATUS_CFG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </FormField>
        )}

        <FormField label="Notes" >
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
            rows={3} placeholder="Optional notes..."
            className={`${inputCls(false)} resize-none md:col-span-2`} />
        </FormField>
      </div>
    </Modal>
  );
};

// ── Row menu ───────────────────────────────────────────────────
const RowMenu = ({ lead, onEdit, onStatusChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setOpen((o) => !o)}
        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-30 w-48 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl"
          onMouseLeave={() => setOpen(false)}>
          <div className="px-3 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Set Status
          </div>
          {Object.entries(STATUS_CFG).map(([key, cfg]) => (
            <button key={key}
              disabled={lead.status === key}
              onClick={() => { setOpen(false); onStatusChange(lead, key); }}
              className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                lead.status === key ? 'cursor-default text-slate-300' : 'text-slate-700 hover:bg-slate-50'
              }`}>
              <span className={`h-2 w-2 rounded-full ${
                key === 'NEW' ? 'bg-blue-500' : key === 'CONTACTED' ? 'bg-amber-500' :
                key === 'CONVERTED' ? 'bg-emerald-500' : 'bg-slate-400'
              }`} />
              {cfg.label}
            </button>
          ))}
          <div className="mx-3 my-1 border-t border-slate-100" />
          <button onClick={() => { setOpen(false); onEdit(lead); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <Pencil size={13} /> Edit
          </button>
        </div>
      )}
    </div>
  );
};

// ── Tab config ─────────────────────────────────────────────────
const TABS = [
  { key: 'ALL',       label: 'All' },
  { key: 'NEW',       label: 'New' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'CONVERTED', label: 'Converted' },
  { key: 'LOST',      label: 'Lost' },
];

// ── Main page ──────────────────────────────────────────────────
const Leads = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [modal, setModal] = useState({ open: false, lead: null });

  const { data, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadApi.list({ limit: 100 }),
  });

  const leads = data?.data ?? [];

  const filtered = leads.filter((l) => {
    const matchTab = activeTab === 'ALL' || l.status === activeTab;
    const matchSearch = `${l.fullName} ${l.phone} ${l.email ?? ''} ${l.source}`
      .toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => leadApi.update(id, { status }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(`Status updated to ${STATUS_CFG[status]?.label}.`);
    },
    onError: (err) => toast.error(err.message),
  });

  const counts = Object.fromEntries(
    TABS.map((t) => [t.key, t.key === 'ALL' ? leads.length : leads.filter((l) => l.status === t.key).length])
  );

  return (
    <div className="max-w-[1200px] mx-auto pb-12 space-y-8">
      <LeadFormModal
        isOpen={modal.open}
        lead={modal.lead}
        onClose={() => setModal({ open: false, lead: null })}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['leads'] })}
      />

      {/* Header */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Lead Management
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">Lead List</h1>
          <p className="mt-2 text-sm text-slate-500">
            Track walk-ins, online inquiries, and convert prospects.
          </p>
        </div>
        <Button className="h-12 rounded-2xl px-5" onClick={() => setModal({ open: true, lead: null })}>
          <Plus size={18} /> Add Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`card p-5 border text-left transition-all ${
              activeTab === tab.key
                ? 'border-primary bg-primary-light'
                : 'border-slate-200 hover:border-primary/30'
            }`}>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{tab.label}</div>
            <div className={`mt-2 text-3xl font-bold ${activeTab === tab.key ? 'text-primary' : 'text-slate-900'}`}>
              {counts[tab.key]}
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card p-4 border-slate-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email or source..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white" />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading leads...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center text-center border-slate-200">
          <Users size={40} className="text-slate-200 mb-4" />
          <div className="text-lg font-semibold text-slate-700">No leads yet</div>
          <div className="mt-2 text-sm text-slate-400 mb-6">Add your first lead to start tracking.</div>
          <Button onClick={() => setModal({ open: true, lead: null })}>
            <Plus size={16} /> Add First Lead
          </Button>
        </div>
      ) : (
        <div className="card border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {['Lead', 'Contact', 'Source', 'Follow-up', 'Status', ''].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((lead) => (
                <tr key={lead.id} className="transition-colors hover:bg-slate-50/70">
                  {/* Lead name */}
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{lead.fullName}</div>
                    {lead.notes && (
                      <div className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">{lead.notes}</div>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
                        <Phone size={11} className="text-slate-300" /> {lead.phone}
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                          <Mail size={11} className="text-slate-300" /> {lead.email}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Source */}
                  <td className="px-5 py-4">
                    <span className="text-[12px] font-medium text-slate-600">
                      {SOURCE_LABELS[lead.source] ?? lead.source}
                    </span>
                  </td>

                  {/* Follow-up */}
                  <td className="px-5 py-4">
                    {lead.followUpDate ? (
                      <div className={`flex items-center gap-1.5 text-[12px] ${
                        lead.isOverdue ? 'font-semibold text-rose-600' : 'text-slate-500'
                      }`}>
                        <CalendarClock size={12} className={lead.isOverdue ? 'text-rose-400' : 'text-slate-300'} />
                        {format(new Date(lead.followUpDate), 'dd MMM yyyy')}
                        {lead.isOverdue && <span className="text-[10px]">(overdue)</span>}
                      </div>
                    ) : (
                      <span className="text-[12px] text-slate-300">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={lead.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <RowMenu
                      lead={lead}
                      onEdit={(l) => setModal({ open: true, lead: l })}
                      onStatusChange={(l, status) => statusMutation.mutate({ id: l.id, status })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-sm text-slate-500">
            Showing <strong className="text-slate-800">{filtered.length}</strong> of{' '}
            <strong className="text-slate-800">{leads.length}</strong> leads
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
