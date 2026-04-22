import React, { useEffect, useState } from 'react';
import {
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import { staffApi } from '../services/planApi';

// ── Constants ──────────────────────────────────────────────────
const ROLES = ['Trainer', 'Manager', 'Receptionist', 'Coach', 'Assistant', 'Nutritionist', 'Other'];

const STATUS_CONFIG = {
  ACTIVE:    { label: 'Active',    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  INACTIVE:  { label: 'Inactive',  classes: 'bg-slate-100 text-slate-500 border-slate-200' },
  SUSPENDED: { label: 'Suspended', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.INACTIVE;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
};

// ── Form helpers outside component ────────────────────────────
const FormField = ({ label, required, error, children }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
    {children}
    {error && <div className="mt-1.5 text-xs text-rose-600">{error}</div>}
  </div>
);

const inputClass = (hasError) =>
  `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
    hasError
      ? 'border-rose-300 bg-rose-50'
      : 'border-slate-200 bg-slate-50 focus:border-primary focus:bg-white'
  }`;

const createInitialForm = (staff) => ({
  name: staff?.name ?? '',
  phone: staff?.phone ?? '',
  email: staff?.email ?? '',
  role: staff?.role ?? '',
});

// ── Staff Form Modal ───────────────────────────────────────────
const StaffFormModal = ({ isOpen, onClose, staff = null, onSaved }) => {
  const isEdit = Boolean(staff);
  const [form, setForm] = useState(createInitialForm(staff));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(createInitialForm(staff));
      setErrors({});
    }
  }, [isOpen, staff]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.role) e.role = 'Select a role.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? staffApi.update(staff.id, payload) : staffApi.create(payload),
    onSuccess: () => {
      toast.success(`Staff member ${isEdit ? 'updated' : 'added'} successfully.`);
      onSaved?.();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      role: form.role,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Staff Member' : 'Add Staff Member'}
      width="560px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Add Staff'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <FormField label="Full Name" required error={errors.name}>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Ravi Sharma"
            className={inputClass(errors.name)}
          />
        </FormField>

        <FormField label="Role" required error={errors.role}>
          <select
            value={form.role}
            onChange={(e) => set('role', e.target.value)}
            className={inputClass(errors.role)}
          >
            <option value="">Select role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </FormField>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Phone">
            <input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+91 9876543210"
              className={inputClass(false)}
            />
          </FormField>

          <FormField label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="staff@example.com"
              className={inputClass(false)}
            />
          </FormField>
        </div>
      </div>
    </Modal>
  );
};

// ── Status Menu ────────────────────────────────────────────────
const StatusMenu = ({ staffMember, onStatusChange, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-9 z-20 w-48 rounded-2xl border border-slate-200 bg-white py-2 shadow-lg"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="px-3 pb-2 pt-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Set Status</div>
          </div>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => { setOpen(false); onStatusChange(staffMember, key); }}
              disabled={staffMember.status === key}
              className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                staffMember.status === key
                  ? 'cursor-default text-slate-300'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${
                key === 'ACTIVE' ? 'bg-emerald-500' :
                key === 'SUSPENDED' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              {cfg.label}
            </button>
          ))}
          <div className="mx-3 my-1 border-t border-slate-100" />
          <button
            onClick={() => { setOpen(false); onEdit(staffMember); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(staffMember); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ── Staff Card ─────────────────────────────────────────────────
const StaffCard = ({ member, onEdit, onStatusChange, onDelete }) => (
  <div className="card px-5 py-4 border-slate-200 flex items-center gap-4">
    <Avatar name={member.name} size="md" />

    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-900">{member.name}</span>
        <StatusBadge status={member.status || 'ACTIVE'} />
      </div>
      <div className="mt-1 text-xs font-medium text-slate-400 uppercase tracking-wide">{member.role}</div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {member.phone && (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Phone size={11} className="text-slate-300" /> {member.phone}
          </span>
        )}
        {member.email && (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Mail size={11} className="text-slate-300" /> {member.email}
          </span>
        )}
      </div>
    </div>

    <StatusMenu
      staffMember={member}
      onStatusChange={onStatusChange}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  </div>
);

// ── Main Page ──────────────────────────────────────────────────
const Staff = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [modal, setModal] = useState({ open: false, staff: null });

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: staffApi.list,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => staffApi.updateStatus(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success(`Status updated to ${STATUS_CONFIG[status]?.label}.`);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => staffApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member removed.');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDelete = (member) => {
    if (window.confirm(`Remove "${member.name}" from your team?`)) {
      deleteMutation.mutate(member.id);
    }
  };

  const tabs = [
    { key: 'ALL',       label: 'All',       count: staffList.length },
    { key: 'ACTIVE',    label: 'Active',    count: staffList.filter((s) => (s.status || 'ACTIVE') === 'ACTIVE').length },
    { key: 'SUSPENDED', label: 'Suspended', count: staffList.filter((s) => s.status === 'SUSPENDED').length },
    { key: 'INACTIVE',  label: 'Inactive',  count: staffList.filter((s) => s.status === 'INACTIVE').length },
  ];

  const filtered = staffList.filter((s) => {
    const matchesTab = activeTab === 'ALL' || (s.status || 'ACTIVE') === activeTab;
    const matchesSearch = `${s.name} ${s.role} ${s.phone ?? ''} ${s.email ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-[1200px] mx-auto pb-12 space-y-8">
      <StaffFormModal
        isOpen={modal.open}
        staff={modal.staff}
        onClose={() => setModal({ open: false, staff: null })}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['staff'] })}
      />

      {/* Header */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Team Management
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">Staff & Trainers</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your team, assign roles, and control staff access.
          </p>
        </div>
        <Button className="h-12 rounded-2xl px-5" onClick={() => setModal({ open: true, staff: null })}>
          <Plus size={18} /> Add Staff Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`card p-5 border text-left transition-all ${
              activeTab === tab.key
                ? 'border-primary bg-primary-light'
                : 'border-slate-200 hover:border-primary/30'
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{tab.label}</div>
            <div className={`mt-2 text-3xl font-bold ${activeTab === tab.key ? 'text-primary' : 'text-slate-900'}`}>
              {tab.count}
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card p-4 border-slate-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, phone or email..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading staff...</div>
      ) : staffList.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center text-center border-slate-200">
          <UserCheck size={40} className="text-slate-200 mb-4" />
          <div className="text-lg font-semibold text-slate-700">No staff members yet</div>
          <div className="mt-2 text-sm text-slate-400 mb-6">Add your first team member to get started.</div>
          <Button onClick={() => setModal({ open: true, staff: null })}>
            <Plus size={16} /> Add First Staff Member
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center border-slate-200 text-sm text-slate-400">
          No staff match your search or filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              onEdit={(s) => setModal({ open: true, staff: s })}
              onStatusChange={(s, status) => statusMutation.mutate({ id: s.id, status })}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Staff;
