import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Ruler,
  Scale,
  User2,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import AddMemberModal from './AddMemberModal';
import { memberApi } from '../../services/planApi';

// ── Helpers ────────────────────────────────────────────────────
const fmt = (d) => (d ? format(new Date(d), 'dd MMM yyyy') : '—');

const SUB_STATUS = {
  ACTIVE:    { label: 'Active',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  EXPIRED:   { label: 'Expired',   cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-rose-50 text-rose-600 border-rose-200' },
  PAUSED:    { label: 'Paused',    cls: 'bg-amber-50 text-amber-700 border-amber-200' },
};
const SubBadge = ({ status }) => {
  const cfg = SUB_STATUS[status] || SUB_STATUS.EXPIRED;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

// ── Section card ───────────────────────────────────────────────
const Section = ({ title, icon: Icon, children }) => (
  <div className="rounded-[24px] border border-slate-200 bg-white p-6">
    <div className="mb-5 flex items-center gap-2.5">
      {Icon && <Icon size={16} className="text-primary" />}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    </div>
    {children}
  </div>
);

// ── Info row ───────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
    <span className="text-sm font-medium text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-800 text-right">{value || '—'}</span>
  </div>
);

// ── Member status badge ────────────────────────────────────────
const MEM_STATUS = {
  ACTIVE:        { label: 'Active',        cls: 'bg-emerald-500' },
  EXPIRING_SOON: { label: 'Expiring Soon', cls: 'bg-amber-500' },
  INACTIVE:      { label: 'Inactive',      cls: 'bg-slate-400' },
};

// ── Page ───────────────────────────────────────────────────────
const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const { data: member, isLoading, isError } = useQuery({
    queryKey: ['member', id],
    queryFn: () => memberApi.get(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto py-20 text-center text-sm text-slate-400">
        Loading member details...
      </div>
    );
  }

  if (isError || !member) {
    return (
      <div className="max-w-[1200px] mx-auto pb-12">
        <button onClick={() => navigate('/members')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary">
          <ArrowLeft size={16} /> Back to Members
        </button>
        <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-12 text-center">
          <div className="text-xl font-semibold text-slate-900">Member not found</div>
        </div>
      </div>
    );
  }

  const activeSub = member.subscriptions?.find((s) => s.status === 'ACTIVE');
  const memStatus = MEM_STATUS[member.status] || MEM_STATUS.INACTIVE;

  return (
    <div className="max-w-[1200px] mx-auto pb-12 space-y-6">
      <AddMemberModal
        isOpen={editOpen}
        editMember={member}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['member', id] });
          queryClient.invalidateQueries({ queryKey: ['members'] });
        }}
      />

      {/* Back */}
      <button
        onClick={() => navigate('/members')}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> Back to member list
      </button>

      {/* Hero card */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <Avatar name={member.fullName} size="xl" />
              <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${memStatus.cls}`} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[1.75rem] font-bold tracking-tight text-slate-900">
                  {member.fullName}
                </h1>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                  member.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : member.status === 'EXPIRING_SOON'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {memStatus.label}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                {member.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-300" /> {member.phone}
                  </span>
                )}
                {member.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} className="text-slate-300" /> {member.email}
                  </span>
                )}
                {(member.city || member.state) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-300" />
                    {[member.city, member.state].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>

              {activeSub && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                  <CreditCard size={12} />
                  {activeSub.plan?.name} — expires {fmt(activeSub.endDate)}
                </div>
              )}
            </div>
          </div>

          <Button onClick={() => setEditOpen(true)} className="rounded-2xl px-5 shrink-0">
            <Pencil size={15} /> Edit Profile
          </Button>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        {/* Left column */}
        <div className="space-y-6">
          <Section title="Personal Information" icon={User2}>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="Full Name" value={member.fullName} />
              <InfoRow label="Gender" value={member.gender ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1) : null} />
              <InfoRow label="Date of Birth" value={fmt(member.dob)} />
              <InfoRow label="Joining Date" value={fmt(member.joiningDate)} />
            </div>
          </Section>

          <Section title="Contact Information" icon={Phone}>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="Phone" value={member.phone} />
              <InfoRow label="Email" value={member.email} />
              <InfoRow label="Address" value={member.address} />
              <InfoRow label="City" value={member.city} />
              <InfoRow label="State" value={member.state} />
              <InfoRow label="Postcode" value={member.postcode} />
            </div>
          </Section>

          <Section title="Physical Information" icon={Scale}>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="Weight" value={member.weight ? `${member.weight} kg` : null} />
              <InfoRow label="Height" value={member.height ? `${member.height} cm` : null} />
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Summary card */}
          <div className="rounded-[24px] bg-gradient-to-br from-primary to-[#5b54d6] p-6 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                <Users size={18} />
              </div>
              <div>
                <div className="font-semibold">Profile Summary</div>
                <div className="text-xs text-white/70">Member overview</div>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm text-white/90">
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-semibold">{memStatus.label}</span>
              </div>
              <div className="flex justify-between">
                <span>Plan</span>
                <span className="font-semibold">{activeSub?.plan?.name || 'No active plan'}</span>
              </div>
              {member.joiningDate && (
                <div className="flex justify-between">
                  <span>Joined</span>
                  <span className="font-semibold">{fmt(member.joiningDate)}</span>
                </div>
              )}
              {activeSub?.endDate && (
                <div className="flex justify-between">
                  <span>Expires</span>
                  <span className="font-semibold">{fmt(activeSub.endDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Subscriptions */}
          <Section title="Subscriptions" icon={CreditCard}>
            {member.subscriptions?.length > 0 ? (
              <div className="space-y-3">
                {member.subscriptions.map((sub) => (
                  <div key={sub.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-sm text-slate-900">
                        {sub.plan?.name ?? 'Unknown Plan'}
                      </div>
                      <SubBadge status={sub.status} />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-slate-500">
                      <span>Start: {fmt(sub.startDate)}</span>
                      <span>End: {fmt(sub.endDate)}</span>
                      {sub.amountPaid != null && (
                        <span>Paid: ₹{sub.amountPaid.toLocaleString()}</span>
                      )}
                      {sub.paymentMethod && (
                        <span className="capitalize">Via: {sub.paymentMethod}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 py-6 text-center text-sm text-slate-400">
                No subscriptions yet
              </div>
            )}
          </Section>

          {/* Attendance */}
          {member.attendance?.length > 0 && (
            <Section title="Recent Attendance" icon={Calendar}>
              <div className="space-y-2">
                {member.attendance.slice(0, 8).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2.5 text-xs">
                    <span className="font-medium text-slate-600">
                      {format(new Date(a.checkIn), 'dd MMM yyyy, HH:mm')}
                    </span>
                    {a.checkOut && (
                      <span className="text-slate-400">
                        Out {format(new Date(a.checkOut), 'HH:mm')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
