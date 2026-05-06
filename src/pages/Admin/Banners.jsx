import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ImageIcon, Loader2, Paintbrush, Pencil, Plus,
  ToggleLeft, ToggleRight, Trash2, Upload, X, Link,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../services/adminApi';

// ── Gradient presets ──────────────────────────────────────────────────

const GRADIENTS = [
  { id: 'aurora',   label: 'Aurora',   value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'sunset',   label: 'Sunset',   value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'ocean',    label: 'Ocean',    value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'mint',     label: 'Mint',     value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 'peach',    label: 'Peach',    value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { id: 'midnight', label: 'Midnight', value: 'linear-gradient(135deg, #0f3460 0%, #533483 100%)' },
  { id: 'rose',     label: 'Rose',     value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #ffecd2 100%)' },
  { id: 'carbon',   label: 'Carbon',   value: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)' },
];

const DEFAULT_GRADIENT = GRADIENTS[0].value;

const LINK_TYPES = [
  { value: '',         label: 'No link' },
  { value: 'external', label: 'External URL' },
  { value: 'business', label: 'Business (by ID)' },
  { value: 'category', label: 'Category (by ID)' },
];

// ── Banner Preview ────────────────────────────────────────────────────

function BannerPreview({ imageUrl, bgColor, title, subtitle }) {
  const bg = bgColor || DEFAULT_GRADIENT;
  return (
    <div
      className="relative w-full h-36 rounded-2xl overflow-hidden flex-shrink-0"
      style={{ background: bg }}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt="preview"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <div className="absolute inset-0 bg-black/20 flex flex-col justify-center px-6">
        {title && <p className="text-white font-bold text-xl leading-snug drop-shadow">{title}</p>}
        {subtitle && <p className="text-white/80 text-sm mt-1 drop-shadow">{subtitle}</p>}
        {!title && !subtitle && (
          <p className="text-white/40 text-sm italic">Add a title to see preview</p>
        )}
      </div>
    </div>
  );
}

// ── Upload Zone ───────────────────────────────────────────────────────

function UploadZone({ onUploaded, currentUrl }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    setUploading(true);
    try {
      const res = await adminApi.uploadBannerImage(file);
      onUploaded(res.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  if (currentUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-32 bg-slate-50">
        <img src={currentUrl} alt="uploaded" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="bg-white rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onUploaded('')}
            className="bg-red-500 rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
          >
            Remove
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`relative border-2 border-dashed rounded-2xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
        dragging ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50 hover:border-primary/50 hover:bg-slate-100'
      }`}
    >
      {uploading ? (
        <Loader2 size={24} className="animate-spin text-primary" />
      ) : (
        <>
          <Upload size={22} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-500">
            {dragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
          </span>
          <span className="text-xs text-slate-400">PNG, JPG, WEBP — max 5 MB</span>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}

// ── Banner Modal ──────────────────────────────────────────────────────

const EMPTY_FORM = {
  imageUrl: '', bgColor: DEFAULT_GRADIENT,
  title: '', subtitle: '',
  linkType: '', linkId: '', linkUrl: '',
  sortOrder: 0, isActive: true,
};

const IMAGE_TABS = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'url',    label: 'URL',    icon: Link },
  { id: 'gradient', label: 'Gradient', icon: Paintbrush },
];

function BannerModal({ banner, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    banner ? {
      imageUrl: banner.imageUrl ?? '',
      bgColor: banner.bgColor ?? DEFAULT_GRADIENT,
      title: banner.title ?? '',
      subtitle: banner.subtitle ?? '',
      linkType: banner.linkType ?? '',
      linkId: banner.linkId ?? '',
      linkUrl: banner.linkUrl ?? '',
      sortOrder: banner.sortOrder ?? 0,
      isActive: banner.isActive ?? true,
    } : { ...EMPTY_FORM }
  );
  const [imageTab, setImageTab] = useState('upload');
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl && !form.bgColor) {
      toast.error('Add an image or choose a background colour');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        imageUrl: form.imageUrl || undefined,
        bgColor: form.bgColor || undefined,
        title: form.title.trim() || undefined,
        subtitle: form.subtitle.trim() || undefined,
        linkType: form.linkType || undefined,
        linkId: form.linkId.trim() || undefined,
        linkUrl: form.linkUrl.trim() || undefined,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };
      if (banner) {
        await adminApi.updateBanner(banner.id, payload);
        toast.success('Banner updated');
      } else {
        await adminApi.createBanner(payload);
        toast.success('Banner created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900">{banner ? 'Edit Banner' : 'New Banner'}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400">
            <X size={17} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-5">

          {/* Live preview */}
          <BannerPreview
            imageUrl={form.imageUrl}
            bgColor={form.bgColor}
            title={form.title}
            subtitle={form.subtitle}
          />

          {/* Image source tabs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Background</label>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-3">
              {IMAGE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setImageTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
                    imageTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>

            {imageTab === 'upload' && (
              <UploadZone currentUrl={form.imageUrl} onUploaded={(url) => set('imageUrl', url)} />
            )}

            {imageTab === 'url' && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => set('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                />
                {form.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 h-24 bg-slate-50">
                    <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>
            )}

            {imageTab === 'gradient' && (
              <div className="grid grid-cols-4 gap-2">
                {GRADIENTS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => { set('bgColor', g.value); set('imageUrl', ''); }}
                    className={`relative h-14 rounded-xl overflow-hidden transition-all ${
                      form.bgColor === g.value && !form.imageUrl
                        ? 'ring-2 ring-offset-2 ring-primary scale-105'
                        : 'hover:scale-105'
                    }`}
                    style={{ background: g.value }}
                    title={g.label}
                  >
                    {form.bgColor === g.value && !form.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-5 w-5 rounded-full bg-white/80 flex items-center justify-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Content</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Title (optional)"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
            />
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => set('subtitle', e.target.value)}
              placeholder="Subtitle (optional)"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>

          {/* Behaviour */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Behaviour</label>
            <select
              value={form.linkType}
              onChange={(e) => set('linkType', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
            >
              {LINK_TYPES.map((lt) => <option key={lt.value} value={lt.value}>{lt.label}</option>)}
            </select>

            {form.linkType === 'external' && (
              <input
                type="url"
                value={form.linkUrl}
                onChange={(e) => set('linkUrl', e.target.value)}
                placeholder="https://..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
              />
            )}
            {(form.linkType === 'business' || form.linkType === 'category') && (
              <input
                type="text"
                value={form.linkId}
                onChange={(e) => set('linkId', e.target.value)}
                placeholder={form.linkType === 'business' ? 'Business ID' : 'Category ID'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
              />
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sort Order</label>
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => set('sortOrder', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Status</label>
                <button
                  type="button"
                  onClick={() => set('isActive', !form.isActive)}
                  className={`w-full flex items-center justify-between rounded-2xl border px-4 py-2.5 transition-colors ${
                    form.isActive ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <span className={`text-sm font-semibold ${form.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-2xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving…' : banner ? 'Save Changes' : 'Create Banner'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Table row preview ─────────────────────────────────────────────────

function BannerThumb({ banner }) {
  const bg = banner.bgColor || DEFAULT_GRADIENT;
  return (
    <div className="h-14 w-24 rounded-xl overflow-hidden flex-shrink-0" style={{ background: bg }}>
      {banner.imageUrl && (
        <img src={banner.imageUrl} alt={banner.title || 'banner'}
          className="h-full w-full object-cover opacity-80"
          onError={(e) => { e.target.style.display = 'none'; }} />
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleActive = async (banner) => {
    try {
      await adminApi.updateBanner(banner.id, { isActive: !banner.isActive });
      setBanners((prev) => prev.map((b) => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
    } catch {
      toast.error('Failed to update banner');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    setDeleting(id);
    try {
      await adminApi.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success('Banner deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Banners</h1>
          <p className="text-sm text-slate-500 mt-0.5">Home screen promotional banners</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModal('new')}>
          <Plus size={16} /> New Banner
        </button>
      </div>

      <div className="card border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <ImageIcon size={22} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No banners yet</p>
            <p className="text-slate-400 text-sm mt-1">Create your first banner to display on the home screen.</p>
            <button className="btn-primary mt-4 inline-flex items-center gap-1.5" onClick={() => setModal('new')}>
              <Plus size={14} /> Add Banner
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left w-8">#</th>
                <th className="px-5 py-3 text-left">Preview</th>
                <th className="px-5 py-3 text-left">Title / Subtitle</th>
                <th className="px-5 py-3 text-left">Link</th>
                <th className="px-5 py-3 text-left">Sort</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b, idx) => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3 text-slate-400 text-xs">{idx + 1}</td>
                  <td className="px-5 py-3"><BannerThumb banner={b} /></td>
                  <td className="px-5 py-3">
                    {b.title
                      ? <p className="font-semibold text-slate-800">{b.title}</p>
                      : <p className="text-slate-400 italic text-xs">No title</p>}
                    {b.subtitle && <p className="text-slate-500 text-xs mt-0.5">{b.subtitle}</p>}
                  </td>
                  <td className="px-5 py-3">
                    {b.linkType
                      ? <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2 py-0.5 font-medium">
                          {b.linkType}
                          {b.linkId && <span className="text-blue-400">#{b.linkId.slice(0, 6)}…</span>}
                        </span>
                      : <span className="text-slate-400 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{b.sortOrder}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleActive(b)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 transition-colors ${
                        b.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {b.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      {b.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setModal(b)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(b.id)} disabled={deleting === b.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                        {deleting === b.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <BannerModal
          banner={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
