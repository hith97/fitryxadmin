import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Users, UserCheck, QrCode, MoreVertical, Building2, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { branchApi } from '../../services/branchApi';
import { useBranch } from '../../context/BranchContext';

const CreateBranchModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', address: '', city: '', state: '', pincode: '', phone: '', email: '', description: '' });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Branch name is required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      await branchApi.createBranch(fd);
      toast.success('Branch created successfully');
      onCreated();
    } catch (err) {
      toast.error(err.message || 'Failed to create branch');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Branch / Location</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Branch Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Downtown Branch, Koramangala" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">City</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="Bengaluru" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">State</label>
              <input name="state" value={form.state} onChange={handleChange} placeholder="Karnataka" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Address</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Street address" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Pincode</label>
              <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="560001" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-primary py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BranchesList = () => {
  const navigate = useNavigate();
  const { branches, switchBranch, selectedBranchId, refreshBranches } = useBranch();
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const handleCreated = () => {
    setShowCreate(false);
    refreshBranches();
  };

  const handleSwitchToBranch = (branchId) => {
    switchBranch(branchId);
    toast.success('Switched to branch');
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Branches & Locations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all your gym locations from one place</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Plus size={16} />
          Add Branch
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="font-semibold text-gray-700">No branches yet</p>
          <p className="text-sm text-gray-500 mt-1">Create your first branch to manage multiple locations</p>
          <button onClick={() => setShowCreate(true)} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
            Add First Branch
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              isActive={branch.id === selectedBranchId}
              onSelect={() => handleSwitchToBranch(branch.id)}
              onManage={() => navigate(`/branches/${branch.id}`)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateBranchModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </div>
  );
};

const BranchCard = ({ branch, isActive, onSelect, onManage }) => {
  const memberCount = branch._count?.members ?? branch.memberCount ?? '–';
  const staffCount = branch._count?.staff ?? branch.staffCount ?? '–';
  const managerCount = branch.branchAccess?.filter((a) => a.role === 'BRANCH_MANAGER').length ?? 0;

  return (
    <div className={`card p-5 transition-all ${isActive ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary-light flex items-center justify-center">
            <Building2 size={18} className="text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-900 text-sm">{branch.name}</span>
              {branch.isMainBranch && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                  <Star size={10} /> Main
                </span>
              )}
            </div>
            {branch.city && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <MapPin size={10} />
                {branch.city}{branch.state ? `, ${branch.state}` : ''}
              </div>
            )}
          </div>
        </div>
        {isActive && (
          <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">ACTIVE</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-base font-bold text-gray-900">{memberCount}</div>
          <div className="text-[10px] text-gray-500">Members</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-base font-bold text-gray-900">{staffCount}</div>
          <div className="text-[10px] text-gray-500">Staff</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-base font-bold text-gray-900">{managerCount}</div>
          <div className="text-[10px] text-gray-500">Managers</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onManage}
          className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Manage
        </button>
        {!isActive && (
          <button
            onClick={onSelect}
            className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
          >
            Switch Here
          </button>
        )}
      </div>
    </div>
  );
};

export default BranchesList;
