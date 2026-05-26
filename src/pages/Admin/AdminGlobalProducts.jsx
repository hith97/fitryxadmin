import React, { useEffect, useState } from 'react';
import { Loader2, Package, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../services/adminApi';

const EMPTY = {
  name: '', description: '', price: '', discountPrice: '',
  stock: '', category: '', images: '', displayOrder: 0, isActive: true,
};

function Modal({ title, form, setForm, onSave, saving, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-[20px] bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Product Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              placeholder="Product name..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white resize-none"
              placeholder="Product description..."
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Discount Price (₹)</label>
              <input
                type="number"
                value={form.discountPrice}
                onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
                placeholder="e.g. Supplements"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Display Order</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Image URLs (comma-separated)</label>
            <textarea
              value={Array.isArray(form.images) ? form.images.join(', ') : form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              rows={2}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white resize-none"
              placeholder="https://..., https://..."
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-slate-700">Active (visible in app)</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !form.name.trim()}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminGlobalProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async (p = page) => {
    try {
      setLoading(true);
      const res = await adminApi.listGlobalProducts(p);
      setProducts(res.data ?? []);
      setPages(res.pages ?? 1);
    } catch (e) {
      toast.error(e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (p) => {
    setForm({
      ...p,
      images: Array.isArray(p.images) ? p.images.join(', ') : (p.images || ''),
    });
    setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const images = typeof form.images === 'string'
        ? form.images.split(',').map((s) => s.trim()).filter(Boolean)
        : form.images;
      const payload = {
        ...form,
        images,
        price: form.price !== '' ? parseFloat(form.price) : undefined,
        discountPrice: form.discountPrice !== '' ? parseFloat(form.discountPrice) : null,
        stock: form.stock !== '' ? parseInt(form.stock) : undefined,
      };
      if (modal === 'create') {
        await adminApi.createGlobalProduct(payload);
        toast.success('Product created');
      } else {
        await adminApi.updateGlobalProduct(form.id, payload);
        toast.success('Product updated');
      }
      setModal(null);
      load(page);
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await adminApi.deleteGlobalProduct(id);
      toast.success('Deleted');
      load(page);
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    }
  };

  const firstImage = (p) => (Array.isArray(p.images) ? p.images[0] : null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Global Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage products shown in the app store</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-primary" /></div>
      ) : products.length === 0 ? (
        <div className="rounded-[20px] border border-slate-200 bg-white p-12 text-center">
          <Package size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400">No products yet. Click "Add Product" to create one.</p>
        </div>
      ) : (
        <div className="rounded-[20px] border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Product</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Price</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Stock</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {firstImage(p) ? (
                        <img src={firstImage(p)} alt="" className="h-10 w-10 rounded-xl object-cover flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Package size={16} className="text-slate-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400 line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{p.category || '—'}</td>
                  <td className="px-5 py-3.5">
                    <div>
                      <span className="font-medium text-slate-800">₹{p.price?.toLocaleString()}</span>
                      {p.discountPrice && (
                        <span className="ml-2 text-xs text-green-600">₹{p.discountPrice?.toLocaleString()}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{p.stock ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg px-3 py-1.5 text-xs font-medium border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">Prev</button>
                <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="rounded-lg px-3 py-1.5 text-xs font-medium border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {modal && (
        <Modal
          title={modal === 'create' ? 'New Product' : 'Edit Product'}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          saving={saving}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
