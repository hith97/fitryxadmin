import React, { useState } from 'react';
import {
  ClipboardList,
  MoreHorizontal,
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
import CreatePlanModal from './Plans/CreatePlanModal';
import { planApi } from '../services/planApi';

const PlanCard = ({ plan, onEdit, onToggle, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="card p-6 flex h-full flex-col justify-between border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-primary-light px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              {plan.membershipCategory?.name || 'General'}
            </div>
            <h3 className="mt-3 text-[18px] font-bold text-slate-900">{plan.name}</h3>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-10 z-10 w-40 rounded-2xl border border-slate-200 bg-white py-2 shadow-lg"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => { setMenuOpen(false); onEdit(plan); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onToggle(plan); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {plan.isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(plan); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-baseline gap-2">
          <div className="text-[28px] font-bold text-slate-900">Rs.{Number(plan.price).toLocaleString()}</div>
          <div className="text-sm font-medium text-slate-400">
            /{plan.duration} days
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {plan.duration} Days
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-600">
            {plan.maxMembers ? `Max ${plan.maxMembers}` : 'Unlimited'}
          </span>
          {plan.planClasses?.length > 0 && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">
              {plan.planClasses.length} class{plan.planClasses.length > 1 ? 'es' : ''}
            </span>
          )}
        </div>

        {plan.description && (
          <p className="mt-5 text-sm leading-6 text-slate-500">{plan.description}</p>
        )}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users size={15} className="text-slate-300" />
            {plan.activeMemberCount || 0} active members
          </div>
          <div className={`text-sm font-semibold ${plan.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
            {plan.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>
    </div>
  );
};

const Plans = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalState, setModalState] = useState({ open: false, plan: null });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: planApi.list,
  });

  const toggleMutation = useMutation({
    mutationFn: (plan) => planApi.toggle(plan.id),
    onSuccess: (_, plan) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success(`${plan.name} ${plan.isActive ? 'deactivated' : 'activated'}.`);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (plan) => planApi.remove(plan.id),
    onSuccess: (_, plan) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success(`${plan.name} deleted.`);
    },
    onError: (err) => toast.error(err.message),
  });

  const filtered = plans.filter((p) => {
    const s = `${p.name} ${p.membershipCategory?.name ?? ''}`.toLowerCase();
    return s.includes(searchQuery.toLowerCase());
  });

  const activePlans = filtered.filter((p) => p.isActive);
  const inactivePlans = filtered.filter((p) => !p.isActive);
  const totalActiveMembers = plans.reduce((t, p) => t + (p.activeMemberCount || 0), 0);

  return (
    <div className="max-w-[1600px] mx-auto pb-12 space-y-8">
      <CreatePlanModal
        isOpen={modalState.open}
        plan={modalState.plan}
        onClose={() => setModalState({ open: false, plan: null })}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['plans'] })}
      />

      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Plan Management
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">Membership Plans</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create and manage membership packages, categories, and class access.
          </p>
        </div>

        <Button className="h-12 rounded-2xl px-5" onClick={() => setModalState({ open: true, plan: null })}>
          <Plus size={18} />
          Create Plan
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="card p-5 border-slate-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[280px] flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plans or categories..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-primary focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div className="card p-5 border-slate-200">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total Plans</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{plans.length}</div>
            <div className="mt-2 text-sm text-slate-500">Available membership plans</div>
          </div>
          <div className="card p-5 border-slate-200">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Active Plans</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{activePlans.length}</div>
            <div className="mt-2 text-sm text-slate-500">Currently active</div>
          </div>
          <div className="card p-5 border-slate-200">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Active Subscribers</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{totalActiveMembers}</div>
            <div className="mt-2 text-sm text-slate-500">Across all plans</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading plans...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center text-center border-slate-200">
          <ClipboardList size={40} className="text-slate-200 mb-4" />
          <div className="text-lg font-semibold text-slate-700">No plans yet</div>
          <div className="mt-2 text-sm text-slate-400">Create your first membership plan to get started.</div>
        </div>
      ) : (
        <>
          {activePlans.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Active Plans</h2>
                  <p className="text-sm text-slate-500">{activePlans.length} plans currently available.</p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {activePlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={(p) => setModalState({ open: true, plan: p })}
                    onToggle={(p) => toggleMutation.mutate(p)}
                    onDelete={(p) => {
                      if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
                        deleteMutation.mutate(p);
                      }
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {inactivePlans.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-700">Inactive Plans</h2>
                  <p className="text-sm text-slate-400">{inactivePlans.length} deactivated plans.</p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {inactivePlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={(p) => setModalState({ open: true, plan: p })}
                    onToggle={(p) => toggleMutation.mutate(p)}
                    onDelete={(p) => {
                      if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
                        deleteMutation.mutate(p);
                      }
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Plans;
