import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import { memberApi, planApi, leadApi } from '../../services/planApi';

// ── Helpers (outside component to prevent focus loss) ──────────
const GENDERS = ['male', 'female', 'nonbinary', 'nottosay'];
const PAYMENT_METHODS = ['cash', 'upi', 'card', 'bank_transfer', 'other'];

const inputCls = (err) =>
  `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
    err
      ? 'border-rose-300 bg-rose-50'
      : 'border-slate-200 bg-slate-50 focus:border-primary focus:bg-white'
  }`;

const FormField = ({ label, required, error, children, className = '' }) => (
  <div className={className}>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
    {children}
    {error && <div className="mt-1.5 text-xs text-rose-600">{error}</div>}
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="rounded-[24px] border border-slate-200 bg-white p-5">
    <h4 className="mb-5 text-base font-semibold text-slate-900">{title}</h4>
    {children}
  </div>
);

// ── Lead status badge ──────────────────────────────────────────
const LEAD_STATUS_CLS = {
  NEW:       'bg-blue-50 text-blue-700 border-blue-200',
  CONTACTED: 'bg-amber-50 text-amber-700 border-amber-200',
};

// ── Initial state ──────────────────────────────────────────────
const EMPTY = {
  fullName: '', phone: '', email: '', gender: '', dob: '',
  address: '', city: '', state: '', postcode: '',
  weight: '', height: '',
  joiningDate: new Date().toISOString().split('T')[0],
  planId: '', startDate: new Date().toISOString().split('T')[0],
  amountPaid: '', discountAmount: '', paymentMethod: 'cash',
};

const STEPS = ['Personal & Contact', 'Physical & Plan'];

const StepPill = ({ active, complete, number, label }) => (
  <div className="flex items-center gap-3">
    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
      complete ? 'bg-emerald-500 text-white' : active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
    }`}>
      {number}
    </div>
    <span className="text-sm font-semibold text-slate-700">{label}</span>
  </div>
);

// ── Main modal ─────────────────────────────────────────────────
const AddMemberModal = ({ isOpen, onClose, onSaved, editMember = null }) => {
  const isEdit = Boolean(editMember);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  const { data: plansData = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: planApi.list,
    enabled: isOpen,
  });

  const { data: leadsData } = useQuery({
    queryKey: ['leads-active'],
    queryFn: () => leadApi.list({ limit: 50 }),
    enabled: isOpen && !isEdit,
  });

  const availableLeads = (leadsData?.data ?? []).filter(
    (l) => l.status === 'NEW' || l.status === 'CONTACTED'
  );

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setErrors({});
      setSelectedLeadId(null);
      if (editMember) {
        setForm({
          fullName: editMember.fullName ?? '',
          phone: editMember.phone ?? '',
          email: editMember.email ?? '',
          gender: editMember.gender ?? '',
          dob: editMember.dob ? editMember.dob.split('T')[0] : '',
          address: editMember.address ?? '',
          city: editMember.city ?? '',
          state: editMember.state ?? '',
          postcode: editMember.postcode ?? '',
          weight: editMember.weight ?? '',
          height: editMember.height ?? '',
          joiningDate: editMember.joiningDate
            ? editMember.joiningDate.split('T')[0]
            : new Date().toISOString().split('T')[0],
          planId: '', startDate: new Date().toISOString().split('T')[0],
          amountPaid: '', discountAmount: '', paymentMethod: 'cash',
        });
      } else {
        setForm(EMPTY);
      }
    }
  }, [isOpen, editMember]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const fillFromLead = (lead) => {
    setSelectedLeadId(lead.id);
    setForm((f) => ({
      ...f,
      fullName: lead.fullName ?? f.fullName,
      phone: lead.phone ?? f.phone,
      email: lead.email ?? f.email,
    }));
    toast.success(`Filled from lead: ${lead.fullName}`);
  };

  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.fullName.trim()) e.fullName = 'Name is required.';
      if (!form.phone.trim()) e.phone = 'Phone is required.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? memberApi.update(editMember.id, payload) : memberApi.create(payload),
    onSuccess: () => {
      toast.success(`Member ${isEdit ? 'updated' : 'added'} successfully.`);
      onSaved?.();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const next = () => {
    if (!validate(step)) { toast.error('Please fill required fields.'); return; }
    setStep((s) => s + 1);
  };

  const submit = () => {
    if (!validate(step)) { toast.error('Please fill required fields.'); return; }
    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      gender: form.gender || undefined,
      dob: form.dob || undefined,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      postcode: form.postcode.trim() || undefined,
      weight: form.weight !== '' ? Number(form.weight) : undefined,
      height: form.height !== '' ? Number(form.height) : undefined,
      joiningDate: form.joiningDate || undefined,
    };
    if (!isEdit && form.planId) {
      payload.planId = form.planId;
      payload.startDate = form.startDate || undefined;
      payload.amountPaid = form.amountPaid !== '' ? Number(form.amountPaid) : undefined;
      payload.discountAmount = form.discountAmount !== '' ? Number(form.discountAmount) : undefined;
      payload.paymentMethod = form.paymentMethod || undefined;
    }
    mutation.mutate(payload);
  };

  const activePlans = Array.isArray(plansData) ? plansData.filter((p) => p.isActive) : [];

  // ── Step 0: Personal + Contact + Lead sidebar ──────────────
  const step0 = (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-5">
        <SectionCard title="Personal Information">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Full Name" required error={errors.fullName} className="md:col-span-2">
              <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)}
                placeholder="e.g. Ravi Sharma" className={inputCls(errors.fullName)} />
            </FormField>
            <FormField label="Gender">
              <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className={inputCls(false)}>
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Date of Birth">
              <input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)}
                className={inputCls(false)} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Contact Information">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Phone" required error={errors.phone}>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                placeholder="+91 9876543210" className={inputCls(errors.phone)} />
            </FormField>
            <FormField label="Email">
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                placeholder="member@example.com" className={inputCls(false)} />
            </FormField>
            <FormField label="Address" className="md:col-span-2">
              <input value={form.address} onChange={(e) => set('address', e.target.value)}
                placeholder="House / Street" className={inputCls(false)} />
            </FormField>
            <FormField label="City">
              <input value={form.city} onChange={(e) => set('city', e.target.value)}
                placeholder="Mumbai" className={inputCls(false)} />
            </FormField>
            <FormField label="State">
              <input value={form.state} onChange={(e) => set('state', e.target.value)}
                placeholder="Maharashtra" className={inputCls(false)} />
            </FormField>
            <FormField label="Postcode">
              <input value={form.postcode} onChange={(e) => set('postcode', e.target.value)}
                placeholder="400001" className={inputCls(false)} />
            </FormField>
          </div>
        </SectionCard>
      </div>

      {/* Lead sidebar */}
      {!isEdit && (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-light text-primary shrink-0">
              <Users size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">From Leads</div>
              <div className="text-[11px] text-slate-400">Click to auto-fill</div>
            </div>
          </div>

          {availableLeads.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No pending leads</div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {availableLeads.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => fillFromLead(lead)}
                  className={`w-full rounded-[18px] border p-3 text-left transition-all ${
                    selectedLeadId === lead.id
                      ? 'border-primary bg-white shadow-sm'
                      : 'border-slate-200 bg-white hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={lead.fullName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-semibold text-slate-900 truncate">
                        {lead.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{lead.phone}</div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      LEAD_STATUS_CLS[lead.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── Step 1: Physical + Plan ────────────────────────────────
  const step1 = (
    <div className="space-y-5">
      <SectionCard title="Physical Information">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Weight (kg)">
            <input type="number" min="0" value={form.weight} onChange={(e) => set('weight', e.target.value)}
              placeholder="e.g. 72" className={inputCls(false)} />
          </FormField>
          <FormField label="Height (cm)">
            <input type="number" min="0" value={form.height} onChange={(e) => set('height', e.target.value)}
              placeholder="e.g. 175" className={inputCls(false)} />
          </FormField>
          <FormField label="Joining Date">
            <input type="date" value={form.joiningDate} onChange={(e) => set('joiningDate', e.target.value)}
              className={inputCls(false)} />
          </FormField>
        </div>
      </SectionCard>

      {!isEdit && (
        <SectionCard title="Assign Membership Plan (Optional)">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Plan" className="md:col-span-2">
              <select value={form.planId} onChange={(e) => set('planId', e.target.value)} className={inputCls(false)}>
                <option value="">No plan — add later</option>
                {activePlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.price} / {p.duration}d
                  </option>
                ))}
              </select>
            </FormField>

            {form.planId && (
              <>
                <FormField label="Start Date">
                  <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)}
                    className={inputCls(false)} />
                </FormField>
                <FormField label="Amount Paid (₹)">
                  <input type="number" min="0" value={form.amountPaid}
                    onChange={(e) => set('amountPaid', e.target.value)}
                    placeholder="e.g. 2000" className={inputCls(false)} />
                </FormField>
                <FormField label="Discount (₹)">
                  <input type="number" min="0" value={form.discountAmount}
                    onChange={(e) => set('discountAmount', e.target.value)}
                    placeholder="e.g. 0" className={inputCls(false)} />
                </FormField>
                <FormField label="Payment Method">
                  <select value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}
                    className={inputCls(false)}>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m.charAt(0).toUpperCase() + m.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </FormField>
              </>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Member' : 'Add Member'}
      width="920px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft size={16} /> Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>Continue <ArrowRight size={16} /></Button>
          ) : (
            <Button onClick={submit} disabled={mutation.isPending}>
              <CheckCircle2 size={16} />
              {mutation.isPending ? 'Saving...' : isEdit ? 'Update Member' : 'Save Member'}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {/* Step pills */}
        <div className="flex flex-wrap gap-6">
          {STEPS.map((label, i) => (
            <StepPill key={label} number={i + 1} label={label} active={step === i} complete={i < step} />
          ))}
        </div>

        {step === 0 ? step0 : step1}
      </div>
    </Modal>
  );
};

export default AddMemberModal;
