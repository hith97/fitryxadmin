import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Clock,
  Pencil,
  Plus,
  Search,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Users,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { classApi, staffApi } from '../services/planApi';

// ── Constants ──────────────────────────────────────────────────
const ALL_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// ── Shared form helpers (defined OUTSIDE any component) ────────
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

const createInitialForm = (cls) => ({
  name: cls?.name ?? '',
  staffId: cls?.staffId ?? '',
  assistantStaffId: cls?.assistantStaffId ?? '',
  location: cls?.location ?? '',
  bookingFee: cls?.bookingFee ?? 0,
  days: cls?.days ?? [],
  startTime: cls?.startTime ?? '',
  endTime: cls?.endTime ?? '',
});

// ── Class Form Modal ───────────────────────────────────────────
const ClassFormModal = ({ isOpen, onClose, cls = null, onSaved }) => {
  const isEdit = Boolean(cls);
  const [form, setForm] = useState(createInitialForm(cls));
  const [errors, setErrors] = useState({});

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: staffApi.list,
    enabled: isOpen,
  });

  const activeStaff = staff.filter((s) => s.isActive !== false);

  useEffect(() => {
    if (isOpen) {
      setForm(createInitialForm(cls));
      setErrors({});
    }
  }, [isOpen, cls]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Class name is required.';
    if (!form.staffId) e.staffId = 'Select a staff member.';
    if (form.days.length === 0) e.days = 'Select at least one day.';
    if (!form.startTime) e.startTime = 'Start time is required.';
    if (!form.endTime) e.endTime = 'End time is required.';
    if (form.assistantStaffId && form.assistantStaffId === form.staffId) {
      e.assistantStaffId = 'Cannot be same as instructor.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? classApi.update(cls.id, payload) : classApi.create(payload),
    onSuccess: () => {
      toast.success(`Class ${isEdit ? 'updated' : 'created'} successfully.`);
      onSaved?.();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!validate()) {
      toast.error('Please fix the errors before saving.');
      return;
    }
    mutation.mutate({
      name: form.name.trim(),
      staffId: form.staffId,
      assistantStaffId: form.assistantStaffId || undefined,
      location: form.location.trim() || undefined,
      bookingFee: Number(form.bookingFee) || 0,
      days: form.days,
      startTime: form.startTime,
      endTime: form.endTime,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Class' : 'Add Class Schedule'}
      width="760px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Class' : 'Add Class'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">

        <FormField label="Class Name" required error={errors.name}>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Morning Yoga, Zumba Advanced"
            className={inputClass(errors.name)}
          />
        </FormField>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Instructor (Staff Member)" required error={errors.staffId}>
            <select
              value={form.staffId}
              onChange={(e) => set('staffId', e.target.value)}
              className={inputClass(errors.staffId)}
            >
              <option value="">Select instructor</option>
              {activeStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Assistant Staff Member" error={errors.assistantStaffId}>
            <select
              value={form.assistantStaffId}
              onChange={(e) => set('assistantStaffId', e.target.value)}
              className={inputClass(errors.assistantStaffId)}
            >
              <option value="">None</option>
              {activeStaff
                .filter((s) => s.id !== form.staffId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
            </select>
          </FormField>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Location">
            <input
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="e.g. Studio A, Pool Deck"
              className={inputClass(false)}
            />
          </FormField>

          <FormField label="Class Booking Fee (Rs.)">
            <input
              type="number"
              min={0}
              value={form.bookingFee}
              onChange={(e) => set('bookingFee', e.target.value)}
              placeholder="0"
              className={inputClass(false)}
            />
          </FormField>
        </div>

        <FormField label="Days" required error={errors.days}>
          <div className="flex flex-wrap gap-2">
            {ALL_DAYS.map((day) => {
              const active = form.days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </FormField>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Start Time" required error={errors.startTime}>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => set('startTime', e.target.value)}
              className={inputClass(errors.startTime)}
            />
          </FormField>

          <FormField label="End Time" required error={errors.endTime}>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => set('endTime', e.target.value)}
              className={inputClass(errors.endTime)}
            />
          </FormField>
        </div>

      </div>
    </Modal>
  );
};

// ── Class Row Card ─────────────────────────────────────────────
const ClassRow = ({ cls, onEdit, onToggle, onDelete }) => (
  <div className={`card px-5 py-4 border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4 transition-all ${!cls.isActive ? 'opacity-60' : ''}`}>
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <BookOpen size={18} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm font-semibold text-slate-900">{cls.name}</div>
          {!cls.isActive && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
              INACTIVE
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users size={11} /> {cls.staff?.name}
            {cls.assistantStaff && <span className="text-slate-400"> + {cls.assistantStaff.name}</span>}
          </span>
          {cls.location && <span>{cls.location}</span>}
        </div>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-3 text-xs sm:justify-end">
      <div className="flex flex-wrap gap-1">
        {cls.days?.map((d) => (
          <span key={d} className="rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-bold text-primary">
            {d}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1 text-slate-600 font-medium">
        <Clock size={12} />
        {cls.startTime} – {cls.endTime}
      </div>
      {cls.bookingFee > 0 && (
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
          Rs.{cls.bookingFee}
        </span>
      )}
    </div>

    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={() => onEdit(cls)}
        className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        title="Edit"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={() => onToggle(cls)}
        className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        title={cls.isActive ? 'Deactivate' : 'Activate'}
      >
        {cls.isActive ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
      </button>
      <button
        onClick={() => onDelete(cls)}
        className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        title="Delete"
      >
        <Trash2 size={15} />
      </button>
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────
const Classes = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, cls: null });

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: classApi.list,
  });

  const toggleMutation = useMutation({
    mutationFn: (cls) => classApi.toggle(cls.id),
    onSuccess: (_, cls) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success(`${cls.name} ${cls.isActive ? 'deactivated' : 'activated'}.`);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (cls) => classApi.remove(cls.id),
    onSuccess: (_, cls) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success(`${cls.name} deleted.`);
    },
    onError: (err) => toast.error(err.message),
  });

  const filtered = classes.filter((c) =>
    `${c.name} ${c.staff?.name ?? ''} ${c.location ?? ''}`.toLowerCase().includes(search.toLowerCase()),
  );

  const active = filtered.filter((c) => c.isActive);
  const inactive = filtered.filter((c) => !c.isActive);

  const handleDelete = (cls) => {
    if (window.confirm(`Delete "${cls.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(cls);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12 space-y-8">
      <ClassFormModal
        isOpen={modal.open}
        cls={modal.cls}
        onClose={() => setModal({ open: false, cls: null })}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['classes'] })}
      />

      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Class Management
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">Class Schedules</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage recurring class schedules, assign instructors, and link classes to membership plans.
          </p>
        </div>
        <Button className="h-12 rounded-2xl px-5" onClick={() => setModal({ open: true, cls: null })}>
          <Plus size={18} />
          Add Class
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="card p-5 border-slate-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search classes, instructors, or location..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="card p-5 border-slate-200">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total Classes</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{classes.length}</div>
            <div className="mt-2 text-sm text-slate-500">{active.length} active · {inactive.length} inactive</div>
          </div>
          <div className="card p-5 border-slate-200">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sessions / Week</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {active.reduce((sum, c) => sum + (c.days?.length ?? 0), 0)}
            </div>
            <div className="mt-2 text-sm text-slate-500">Across active classes</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading classes...</div>
      ) : classes.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center text-center border-slate-200">
          <BookOpen size={40} className="text-slate-200 mb-4" />
          <div className="text-lg font-semibold text-slate-700">No classes yet</div>
          <div className="mt-2 text-sm text-slate-400 mb-6">
            Add your first class schedule to start managing sessions.
          </div>
          <Button onClick={() => setModal({ open: true, cls: null })}>
            <Plus size={16} /> Add First Class
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Active Classes</h2>
                  <p className="text-sm text-slate-500">{active.length} scheduled</p>
                </div>
              </div>
              <div className="space-y-3">
                {active.map((cls) => (
                  <ClassRow
                    key={cls.id}
                    cls={cls}
                    onEdit={(c) => setModal({ open: true, cls: c })}
                    onToggle={(c) => toggleMutation.mutate(c)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}

          {inactive.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-600">Inactive Classes</h2>
                  <p className="text-sm text-slate-400">{inactive.length} deactivated</p>
                </div>
              </div>
              <div className="space-y-3">
                {inactive.map((cls) => (
                  <ClassRow
                    key={cls.id}
                    cls={cls}
                    onEdit={(c) => setModal({ open: true, cls: c })}
                    onToggle={(c) => toggleMutation.mutate(c)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Classes;
