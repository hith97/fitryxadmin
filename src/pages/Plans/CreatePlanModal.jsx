import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { planApi, membershipCategoryApi, classApi } from '../../services/planApi';

// ── Shared helpers defined OUTSIDE the component ───────────────
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
      ? 'border-rose-300 bg-rose-50 focus:border-rose-400'
      : 'border-slate-200 bg-slate-50 focus:border-primary focus:bg-white'
  }`;

const createInitialState = (plan) => ({
  name: plan?.name ?? '',
  membershipCategoryId: plan?.membershipCategoryId ?? '',
  duration: plan?.duration ?? 30,
  maxMembersEnabled: plan ? plan.maxMembers != null : false,
  maxMembers: plan?.maxMembers ?? '',
  price: plan?.price ?? '',
  discountPrice: plan?.discountPrice ?? '',
  classIds: plan?.planClasses?.map((pc) => pc.class.id) ?? [],
  description: plan?.description ?? '',
});

// ── Modal Component ────────────────────────────────────────────
const CreatePlanModal = ({ isOpen, onClose, plan = null, onSaved }) => {
  const isEdit = Boolean(plan);
  const [form, setForm] = useState(createInitialState(plan));
  const [errors, setErrors] = useState({});

  const { data: categories = [] } = useQuery({
    queryKey: ['membership-categories'],
    queryFn: membershipCategoryApi.list,
    enabled: isOpen,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: classApi.list,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      setForm(createInitialState(plan));
      setErrors({});
    }
  }, [isOpen, plan]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const toggleClass = (id) => {
    setForm((f) => ({
      ...f,
      classIds: f.classIds.includes(id)
        ? f.classIds.filter((c) => c !== id)
        : [...f.classIds, id],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Plan name is required.';
    if (!form.membershipCategoryId) e.membershipCategoryId = 'Select a category.';
    if (!form.duration || Number(form.duration) < 1) e.duration = 'Duration must be at least 1 day.';
    if (!form.price || Number(form.price) < 0) e.price = 'Amount is required.';
    if (form.maxMembersEnabled && (!form.maxMembers || Number(form.maxMembers) < 1)) {
      e.maxMembers = 'Enter a valid member limit.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? planApi.update(plan.id, payload) : planApi.create(payload),
    onSuccess: () => {
      toast.success(`Plan ${isEdit ? 'updated' : 'created'} successfully.`);
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
      membershipCategoryId: Number(form.membershipCategoryId),
      duration: Number(form.duration),
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      maxMembers: form.maxMembersEnabled ? Number(form.maxMembers) : null,
      classIds: form.classIds,
      description: form.description.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Plan' : 'Create Membership Plan'}
      width="860px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">

        {/* Name + Category */}
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Plan Name" required error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Monthly Standard"
              className={inputClass(errors.name)}
            />
          </FormField>

          <FormField label="Membership Category" required error={errors.membershipCategoryId}>
            <select
              value={form.membershipCategoryId}
              onChange={(e) => set('membershipCategoryId', e.target.value)}
              className={inputClass(errors.membershipCategoryId)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Duration + Price + Discount */}
        <div className="grid gap-5 md:grid-cols-3">
          <FormField label="Duration (Days)" required error={errors.duration}>
            <input
              type="number"
              min={1}
              value={form.duration}
              onChange={(e) => set('duration', e.target.value)}
              placeholder="30"
              className={inputClass(errors.duration)}
            />
          </FormField>

          <FormField label="Amount (Rs.)" required error={errors.price}>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="1500"
              className={inputClass(errors.price)}
            />
          </FormField>

          <FormField label="Discount Price (Rs.)">
            <input
              type="number"
              min={0}
              value={form.discountPrice}
              onChange={(e) => set('discountPrice', e.target.value)}
              placeholder="Optional"
              className={inputClass(false)}
            />
          </FormField>
        </div>

        {/* Membership Limit */}
        <FormField label="Membership Limit" error={errors.maxMembers}>
          <div className="flex items-center gap-6 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!form.maxMembersEnabled}
                onChange={() => set('maxMembersEnabled', false)}
                className="accent-primary"
              />
              <span className="text-sm font-medium text-slate-700">Unlimited</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={form.maxMembersEnabled}
                onChange={() => set('maxMembersEnabled', true)}
                className="accent-primary"
              />
              <span className="text-sm font-medium text-slate-700">Limited</span>
            </label>
          </div>
          {form.maxMembersEnabled && (
            <input
              type="number"
              min={1}
              value={form.maxMembers}
              onChange={(e) => set('maxMembers', e.target.value)}
              placeholder="Max number of members"
              className={inputClass(errors.maxMembers)}
            />
          )}
        </FormField>

        {/* Select Classes (optional) */}
        <FormField label="Select Classes (Optional)">
          {classes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
              No classes created yet. Add classes first to link them here.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {classes.map((cls) => {
                const selected = form.classIds.includes(cls.id);
                return (
                  <label
                    key={cls.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                      selected
                        ? 'border-primary bg-primary-light'
                        : 'border-slate-200 bg-slate-50 hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleClass(cls.id)}
                      className="accent-primary"
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{cls.name}</div>
                      <div className="text-xs text-slate-500">
                        {cls.days?.join(', ')} · {cls.startTime}–{cls.endTime}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </FormField>

        {/* Description */}
        <FormField label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Describe plan benefits, access rules..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-white"
          />
        </FormField>

      </div>
    </Modal>
  );
};

export default CreatePlanModal;
