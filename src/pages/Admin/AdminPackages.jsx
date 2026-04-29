import React, { useEffect, useState } from 'react';
import { Package, Pencil, Plus, RefreshCw, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { adminApi } from '../../services/adminApi';

const EMPTY_FORM = { name: '', price: '', durationDays: '30', description: '' };

const PackageModal = ({ pkg, onClose, onSaved }) => {
  const [form, setForm] = useState(pkg ? { name: pkg.name, price: String(pkg.price), durationDays: String(pkg.durationDays), description: pkg.description || '' } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, price: Number(form.price), durationDays: Number(form.durationDays), description: form.description };
      if (pkg) await adminApi.updatePackage(pkg.id, payload);
      else await adminApi.createPackage(payload);
      toast.success(pkg ? 'Package updated.' : 'Package created.');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = 'text', props = {}) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{label}</label>
      <input type={type} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white" {...props} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">{pkg ? 'Edit Package' : 'New Package'}</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {field('Package Name', 'name', 'text', { required: true, placeholder: 'e.g. Pro Monthly' })}
          <div className="grid grid-cols-2 gap-4">
            {field('Price (₹)', 'price', 'number', { required: true, min: 0, placeholder: '500' })}
            {field('Duration (days)', 'durationDays', 'number', { required: true, min: 1, placeholder: '30' })}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3}
              placeholder="Optional description…"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1 rounded-2xl" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 rounded-2xl" disabled={saving}>{saving ? 'Saving…' : pkg ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | 'create' | package obj

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPackages();
      setPackages(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Package size={14} /> Platform Packages
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">Partner Packages</h1>
          <p className="mt-2 text-sm text-slate-500">Manage subscription plans offered to partner businesses.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="h-12 rounded-2xl px-5" onClick={fetchPackages} disabled={loading}>
            <RefreshCw size={18} /> Refresh
          </Button>
          <Button className="h-12 rounded-2xl px-5" onClick={() => setModal('create')}>
            <Plus size={18} /> New Package
          </Button>
        </div>
      </div>

      {loading
        ? <div className="card p-8 text-center text-sm font-semibold text-slate-500">Loading packages…</div>
        : (
          <div className="grid gap-4 md:grid-cols-2">
            {packages.map((pkg) => (
              <div key={pkg.id} className="card border-slate-200 p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold text-slate-900">{pkg.name}</div>
                    {pkg.description && <div className="mt-1 text-sm text-slate-500">{pkg.description}</div>}
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${pkg.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Price</div>
                    <div className="mt-1 text-2xl font-bold text-slate-900">{pkg.price === 0 ? 'Free' : `₹${pkg.price}`}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Duration</div>
                    <div className="mt-1 text-2xl font-bold text-slate-900">{pkg.durationDays} days</div>
                  </div>
                </div>
                <button onClick={() => setModal(pkg)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary transition-colors">
                  <Pencil size={14} /> Edit Package
                </button>
              </div>
            ))}
            {packages.length === 0 && (
              <div className="col-span-2 card p-8 text-center text-sm text-slate-400">No packages yet. Create one to get started.</div>
            )}
          </div>
        )}

      {modal && (
        <PackageModal
          pkg={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchPackages}
        />
      )}
    </div>
  );
};

export default AdminPackages;
