import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
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

// ── Pagination ─────────────────────────────────────────────────
const Pagination = ({ page, totalPages, total, limit, onPageChange }) => {
  const [goTo, setGoTo] = useState('');

  const start = Math.min((page - 1) * limit + 1, total);
  const end   = Math.min(page * limit, total);

  const pages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const list = [1];
    if (page > 3) list.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) list.push(i);
    if (page < totalPages - 2) list.push('…');
    if (totalPages > 1) list.push(totalPages);
    return list;
  })();

  const handleGoTo = (e) => {
    e.preventDefault();
    const p = parseInt(goTo, 10);
    if (p >= 1 && p <= totalPages) { onPageChange(p); setGoTo(''); }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
      <span className="text-[13px] text-slate-500">
        Showing <strong className="text-slate-800">{start}–{end}</strong> of{' '}
        <strong className="text-slate-800">{total}</strong> members
      </span>

      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="flex h-8 w-8 items-center justify-center text-[13px] text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border text-[13px] font-semibold transition ${
                p === page
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary'
              }`}
            >
              {p}
            </button>
          ),
        )}

        {/* Next */}
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>

        {/* Go to page */}
        {totalPages > 3 && (
          <form onSubmit={handleGoTo} className="ml-2 flex items-center gap-1.5">
            <span className="text-[12px] text-slate-400">Go to</span>
            <input
              value={goTo}
              onChange={(e) => setGoTo(e.target.value)}
              className="h-8 w-12 rounded-xl border border-slate-200 bg-white px-2 text-center text-[13px] font-semibold text-slate-700 outline-none focus:border-primary"
              placeholder="—"
            />
          </form>
        )}
      </div>
    </div>
  );
};

// ── Checkbox ───────────────────────────────────────────────────
const Checkbox = ({ checked, indeterminate, onChange, onClick }) => (
  <input
    type="checkbox"
    checked={checked}
    ref={(el) => { if (el) el.indeterminate = !!indeterminate; }}
    onChange={onChange}
    onClick={onClick}
    className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-primary"
  />
);

// ── Main page ──────────────────────────────────────────────────
const MembersList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch]   = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [modal, setModal]     = useState({ open: false, member: null });
  const [page, setPage]       = useState(1);
  const [selected, setSelected] = useState(new Set());

  // Clear selection on page/filter change
  useEffect(() => setSelected(new Set()), [page, search, activeTab]);

  const { data, isLoading } = useQuery({
    queryKey: ['members', { search, activeTab, page }],
    queryFn: () => memberApi.list({
      search: search || undefined,
      status: activeTab === 'ALL' ? undefined : activeTab,
      page,
      limit: 20,
    }),
    keepPreviousData: true,
  });

  const members = data?.data ?? [];
  const meta    = data?.meta ?? { total: 0, totalPages: 1 };
  const statusCounts = data?.statusCounts ?? { ALL: 0, ACTIVE: 0, EXPIRING_SOON: 0, INACTIVE: 0 };

  // Already filtered server-side
  const filtered = members;

  // ── Selection helpers ──────────────────────────────────────────
  const pageIds   = filtered.map((m) => m.id);
  const allSelected  = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someSelected = pageIds.some((id) => selected.has(id));

  const toggleAll = (e) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach((id) => next.delete(id));
      else             pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleOne = (id, e) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Mutations ──────────────────────────────────────────────────
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

  const handleBulkDelete = () => {
    if (!window.confirm(`Delete ${selected.size} selected member${selected.size !== 1 ? 's' : ''}? This cannot be undone.`)) return;
    Promise.all([...selected].map((id) => memberApi.remove(id))).then(() => {
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success(`${selected.size} member${selected.size !== 1 ? 's' : ''} deleted.`);
    }).catch(() => toast.error('Some deletions failed.'));
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

      {/* Tab stats — all counts from backend (not just current page) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
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
              {isLoading ? '—' : statusCounts[tab.key]}
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
            placeholder="Search by name, phone, email or member ID..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
          />
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3">
          <span className="text-sm font-semibold text-rose-700">
            {selected.size} member{selected.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
            >
              <Trash2 size={13} /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="card border-slate-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0">
              <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
              <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center text-center border-slate-200">
          <Users size={40} className="text-slate-200 mb-4" />
          <div className="text-lg font-semibold text-slate-700">No members found</div>
          <div className="mt-2 text-sm text-slate-400 mb-6">
            {search ? 'Try a different search term.' : 'Add your first member to get started.'}
          </div>
          {!search && (
            <Button onClick={() => setModal({ open: true, member: null })}>
              <Plus size={16} /> Add First Member
            </Button>
          )}
        </div>
      ) : (
        <div className="card border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {/* Select all */}
                  <th className="w-12 px-4 py-3.5 text-center">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={!allSelected && someSelected}
                      onChange={() => {}}
                      onClick={toggleAll}
                    />
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Member
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Contact
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Location
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Plan
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Joined
                  </th>
                  <th className="w-12 px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((member) => {
                  const isSelected = selected.has(member.id);
                  return (
                    <tr
                      key={member.id}
                      onClick={() => navigate(`/members/${member.id}`)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50/70 ${isSelected ? 'bg-primary/[0.03]' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="w-12 px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => {}}
                          onClick={(e) => toggleOne(member.id, e)}
                        />
                      </td>

                      {/* Member */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={member.fullName} size="sm" />
                          <div>
                            <div className="font-semibold text-slate-900">{member.fullName}</div>
                            {member.memberNumber ? (
                              <div className="mt-0.5 inline-flex items-center rounded-md bg-primary/8 px-1.5 py-0.5 text-[10px] font-bold tabular-nums tracking-wider text-primary/70">
                                {member.memberNumber}
                              </div>
                            ) : member.gender ? (
                              <div className="text-[11px] capitalize text-slate-400">{member.gender}</div>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-4">
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
                      <td className="px-4 py-4">
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
                      <td className="px-4 py-4">
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
                      <td className="px-4 py-4">
                        <StatusBadge status={member.status} />
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-4">
                        <div className="text-[12px] text-slate-500">
                          {member.joiningDate
                            ? format(new Date(member.joiningDate), 'dd MMM yyyy')
                            : format(new Date(member.createdAt), 'dd MMM yyyy')}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-4">
                        <RowMenu
                          member={member}
                          onEdit={(m) => setModal({ open: true, member: m })}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={meta.totalPages}
            total={meta.total}
            limit={20}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};

export default MembersList;
