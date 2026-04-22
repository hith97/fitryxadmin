import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import AddMemberModal from './AddMemberModal';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { memberApi } from '../../services/planApi';

// ── Status badge ───────────────────────────────────────────────
const STATUS_CFG = {
  ACTIVE:        { label: 'Active',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  EXPIRING_SOON: { label: 'Expiring Soon', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  INACTIVE:      { label: 'Inactive',      cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.INACTIVE;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

// ── Row action menu ────────────────────────────────────────────
const RowMenu = ({ member, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-9 z-30 w-40 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl"
          onMouseLeave={() => setOpen(false)}
        >
          <button
            onClick={() => { setOpen(false); onEdit(member); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(member); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ── Tab config ─────────────────────────────────────────────────
const TABS = [
  { key: 'ALL',           label: 'All Members' },
  { key: 'ACTIVE',        label: 'Active' },
  { key: 'EXPIRING_SOON', label: 'Expiring Soon' },
  { key: 'INACTIVE',      label: 'Inactive' },
];

// ── Main page ──────────────────────────────────────────────────
const MembersList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [modal, setModal] = useState({ open: false, member: null });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['members', { search, page }],
    queryFn: () => memberApi.list({ search: search || undefined, page, limit: 20 }),
    keepPreviousData: true,
  });

  const members = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, totalPages: 1 };

  const filtered = activeTab === 'ALL' ? members : members.filter((m) => m.status === activeTab);

  const deleteMutation = useMutation({
    mutationFn: (id) => memberApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member removed.');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDelete = (member) => {
    if (window.confirm(`Remove "${member.fullName}" from your gym?`)) {
      deleteMutation.mutate(member.id);
    }
  };

  const counts = {
    ALL:           members.length,
    ACTIVE:        members.filter((m) => m.status === 'ACTIVE').length,
    EXPIRING_SOON: members.filter((m) => m.status === 'EXPIRING_SOON').length,
    INACTIVE:      members.filter((m) => m.status === 'INACTIVE').length,
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12 space-y-8">
      <AddMemberModal
        isOpen={modal.open}
        editMember={modal.member}
        onClose={() => setModal({ open: false, member: null })}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['members'] })}
      />

      {/* Header */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Members
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">Member List</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage members, assign plans, and track active subscriptions.
          </p>
        </div>
        <Button className="h-12 rounded-2xl px-5" onClick={() => setModal({ open: true, member: null })}>
          <Plus size={18} /> Add Member
        </Button>
      </div>

      {/* Tab stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`card p-5 border text-left transition-all ${
              activeTab === tab.key
                ? 'border-primary bg-primary-light'
                : 'border-slate-200 hover:border-primary/30'
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {tab.label}
            </div>
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
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, phone or email..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading members...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center text-center border-slate-200">
          <Users size={40} className="text-slate-200 mb-4" />
          <div className="text-lg font-semibold text-slate-700">No members yet</div>
          <div className="mt-2 text-sm text-slate-400 mb-6">Add your first member to get started.</div>
          <Button onClick={() => setModal({ open: true, member: null })}>
            <Plus size={16} /> Add First Member
          </Button>
        </div>
      ) : (
        <>
          <div className="card border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Member
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Contact
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Location
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Plan
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Joined
                  </th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => navigate(`/members/${member.id}`)}
                    className="cursor-pointer transition-colors hover:bg-slate-50/70"
                  >
                    {/* Member name + avatar */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={member.fullName} size="sm" />
                        <div>
                          <div className="font-semibold text-slate-900">{member.fullName}</div>
                          {member.gender && (
                            <div className="text-[11px] capitalize text-slate-400">{member.gender}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {member.phone && (
                          <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
                            <Phone size={11} className="text-slate-300" /> {member.phone}
                          </div>
                        )}
                        {member.email && (
                          <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                            <Mail size={11} className="text-slate-300" /> {member.email}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      {(member.city || member.state) ? (
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                          <MapPin size={11} className="text-slate-300" />
                          {[member.city, member.state].filter(Boolean).join(', ')}
                        </div>
                      ) : (
                        <span className="text-[12px] text-slate-300">—</span>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-4">
                      {member.activePlan ? (
                        <div>
                          <div className="text-[12px] font-semibold text-primary">
                            {member.activePlan.name}
                          </div>
                          {member.subscriptionEndDate && (
                            <div className="text-[11px] text-slate-400">
                              Exp {format(new Date(member.subscriptionEndDate), 'dd MMM yy')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[12px] text-slate-300">No plan</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={member.status} />
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4">
                      <div className="text-[12px] text-slate-500">
                        {member.joiningDate
                          ? format(new Date(member.joiningDate), 'dd MMM yyyy')
                          : format(new Date(member.createdAt), 'dd MMM yyyy')}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <RowMenu
                        member={member}
                        onEdit={(m) => setModal({ open: true, member: m })}
                        onDelete={handleDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-sm text-slate-500">
              <span>
                Showing <strong className="text-slate-800">{filtered.length}</strong> of{' '}
                <strong className="text-slate-800">{meta.total}</strong> members
              </span>
              {meta.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={(e) => { e.stopPropagation(); setPage((p) => p - 1); }}
                    className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-white"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-semibold">
                    {page} / {meta.totalPages}
                  </span>
                  <button
                    disabled={page === meta.totalPages}
                    onClick={(e) => { e.stopPropagation(); setPage((p) => p + 1); }}
                    className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-white"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MembersList;
