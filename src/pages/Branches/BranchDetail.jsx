import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Phone, Mail, Users, UserCheck, QrCode,
  Plus, Trash2, Building2, Star, Shield, UserCog, Edit3, Save, X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { branchApi } from '../../services/branchApi';
import { useBranch } from '../../context/BranchContext';

const ROLE_LABELS = {
  OWNER: { label: 'Owner', color: 'text-purple-700 bg-purple-50' },
  BRANCH_MANAGER: { label: 'Manager', color: 'text-blue-700 bg-blue-50' },
  STAFF: { label: 'Staff', color: 'text-gray-700 bg-gray-100' },
};

const AssignAccessModal = ({ branchId, onClose, onAssigned }) => {
  const [form, setForm] = useState({ phone: '', email: '', role: 'BRANCH_MANAGER' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone && !form.email) return toast.error('Enter phone or email to find the user');
    setSaving(true);
    try {
      await branchApi.assignAccess(branchId, form);
      toast.success('Access assigned successfully');
      onAssigned();
    } catch (err) {
      toast.error(err.message || 'Failed to assign access');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Assign Branch Access</h3>
        <p className="text-sm text-gray-500 mb-4">
          The user must already have an account on Fitryx (via phone OTP sign-in).
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">or Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="manager@example.com"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="BRANCH_MANAGER">Branch Manager — full branch operations</option>
              <option value="STAFF">Staff — limited access (check-ins, schedule)</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-primary py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60">
              {saving ? 'Assigning...' : 'Assign Access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditBranchModal = ({ branch, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: branch.name || '',
    address: branch.address || '',
    city: branch.city || '',
    state: branch.state || '',
    pincode: branch.pincode || '',
    phone: branch.phone || '',
    email: branch.email || '',
    description: branch.description || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await branchApi.updateBranch(branch.id, form);
      toast.success('Branch updated');
      onSaved();
    } catch (err) {
      toast.error(err.message || 'Failed to update branch');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Branch</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Branch Name</label>
            <input name="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">City</label>
              <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">State</label>
              <input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Address</label>
            <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Pincode</label>
              <input value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-primary py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BranchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { switchBranch, refreshBranches } = useBranch();
  const [branch, setBranch] = useState(null);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const load = async () => {
    try {
      const data = await branchApi.getBranch(id);
      setBranch(data);
    } catch (err) {
      toast.error('Failed to load branch');
    } finally {
      setLoading(false);
    }
  };

  const loadQr = async () => {
    try {
      const data = await branchApi.getBranchQr(id);
      setQr(data);
    } catch {}
  };

  useEffect(() => { load(); loadQr(); }, [id]);

  const handleRemoveAccess = async (userId, userName) => {
    if (!window.confirm(`Remove access for ${userName}?`)) return;
    try {
      await branchApi.removeAccess(id, userId);
      toast.success('Access removed');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to remove access');
    }
  };

  const handleSwitchToBranch = () => {
    switchBranch(id);
    toast.success(`Switched to ${branch.name}`);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="h-8 w-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!branch) return null;

  const managers = branch.branchAccess?.filter((a) => a.role === 'BRANCH_MANAGER') ?? [];
  const staff = branch.branchAccess?.filter((a) => a.role === 'STAFF') ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/branches')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{branch.name}</h1>
              {branch.isMainBranch && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <Star size={10} /> Main Branch
                </span>
              )}
            </div>
            {branch.city && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <MapPin size={12} /> {branch.city}{branch.state ? `, ${branch.state}` : ''}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <Edit3 size={14} /> Edit
          </button>
          <button onClick={handleSwitchToBranch} className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90">
            Switch to Branch
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Members', value: branch._count?.members ?? '–', icon: Users, color: 'text-blue-600 bg-blue-50' },
              { label: 'Staff', value: branch._count?.staff ?? '–', icon: UserCheck, color: 'text-green-600 bg-green-50' },
              { label: 'Leads', value: branch._count?.leads ?? '–', icon: Shield, color: 'text-orange-600 bg-orange-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-4">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-2 ${color}`}>
                  <Icon size={18} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Branch Details */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-4">Branch Details</h2>
            <div className="space-y-3 text-sm">
              {branch.address && (
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin size={14} className="mt-0.5 text-gray-400 shrink-0" />
                  <span>{branch.address}, {branch.city}, {branch.state} {branch.pincode}</span>
                </div>
              )}
              {branch.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone size={14} className="text-gray-400" /> {branch.phone}
                </div>
              )}
              {branch.email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail size={14} className="text-gray-400" /> {branch.email}
                </div>
              )}
              {branch.description && (
                <p className="text-gray-600 pt-1">{branch.description}</p>
              )}
            </div>
          </div>

          {/* Access Management */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Access Management</h2>
              <button
                onClick={() => setShowAssign(true)}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
              >
                <Plus size={14} /> Assign Access
              </button>
            </div>

            {branch.branchAccess?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserCog size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No managers or staff assigned yet</p>
                <button onClick={() => setShowAssign(true)} className="mt-3 text-primary text-sm font-semibold hover:underline">
                  Assign someone now
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {[...managers, ...staff].map((access) => {
                  const u = access.user;
                  const roleConfig = ROLE_LABELS[access.role] || ROLE_LABELS.STAFF;
                  const displayName = u?.email || u?.phone || u?.id;

                  return (
                    <div key={access.userId || u?.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-xs font-bold text-primary uppercase">
                          {displayName?.[0] || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{displayName}</div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleConfig.color}`}>
                            {roleConfig.label}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAccess(u?.id, displayName)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                        title="Remove access"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column — QR */}
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <QrCode size={16} className="text-primary" />
              <h2 className="font-bold text-gray-900">Branch QR Code</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Unique QR code for this branch. Members scan this for check-in.
            </p>
            {qr ? (
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <div className="text-xs text-gray-500 mb-2 font-mono break-all">{qr.qrToken}</div>
                <p className="text-xs text-gray-400">Token ID for this branch's QR</p>
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-400 text-sm">
                QR not available
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'View Members', path: '/members' },
                { label: 'View Staff', path: '/staff' },
                { label: 'View Plans', path: '/plans' },
                { label: 'View Leads', path: '/leads' },
              ].map(({ label, path }) => (
                <button
                  key={label}
                  onClick={() => { switchBranch(id); navigate(path); }}
                  className="w-full text-left rounded-xl border border-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-200"
                >
                  {label} →
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAssign && (
        <AssignAccessModal
          branchId={id}
          onClose={() => setShowAssign(false)}
          onAssigned={() => { setShowAssign(false); load(); }}
        />
      )}

      {showEdit && (
        <EditBranchModal
          branch={branch}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); load(); refreshBranches(); }}
        />
      )}
    </div>
  );
};

export default BranchDetail;
