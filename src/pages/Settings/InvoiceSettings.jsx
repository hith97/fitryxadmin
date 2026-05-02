import React, { useState, useEffect } from 'react';
import { FileText, Save, Upload, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { businessApi, uploadApi } from '../../services/planApi';

const inputCls = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white transition-all';
const labelCls = 'block text-sm font-semibold text-slate-700 mb-1.5';

const InvoiceSettings = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: '', state: '',
    gstNumber: '', invoiceFooter: '', logoUrl: '',
  });
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['business-profile'],
    queryFn: businessApi.getProfile,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name:          profile.name         ?? '',
        phone:         profile.phone        ?? '',
        email:         profile.email        ?? '',
        address:       profile.address      ?? '',
        city:          profile.city         ?? '',
        state:         profile.state        ?? '',
        gstNumber:     profile.gstNumber    ?? '',
        invoiceFooter: profile.invoiceFooter ?? '',
        logoUrl:       profile.logoUrl      ?? '',
      });
      setDirty(false);
    }
  }, [profile]);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setDirty(true); };

  const saveMutation = useMutation({
    mutationFn: (data) => businessApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Invoice settings saved.');
      qc.invalidateQueries({ queryKey: ['business-profile'] });
      setDirty(false);
    },
    onError: (err) => toast.error(err.message || 'Save failed.'),
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      set('logoUrl', res.url);
      toast.success('Logo uploaded.');
    } catch (err) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    saveMutation.mutate({
      name:          form.name,
      phone:         form.phone,
      email:         form.email,
      address:       form.address,
      city:          form.city,
      state:         form.state,
      gstNumber:     form.gstNumber,
      invoiceFooter: form.invoiceFooter,
      logoUrl:       form.logoUrl,
    });
  };

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Invoice Settings</h2>
          <p className="mt-1 text-sm text-slate-500">These details appear on every invoice and receipt.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || !dirty}
          className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          <Save size={15} />
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Logo */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-900">Business Logo</h3>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
            {form.logoUrl ? (
              <img src={form.logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
            ) : (
              <FileText size={28} className="text-slate-300" />
            )}
          </div>
          <div className="space-y-2">
            <label className="cursor-pointer flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Upload size={14} />
              {uploading ? 'Uploading...' : 'Upload Logo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
            </label>
            {form.logoUrl && (
              <button onClick={() => set('logoUrl', '')}
                className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700">
                <X size={12} /> Remove logo
              </button>
            )}
            <p className="text-xs text-slate-400">PNG, JPG or WebP. Shown in top-left of invoices.</p>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-900">Business Details</h3>

        <div>
          <label className={labelCls}>Business Name</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Roar Fitness Zone" className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Contact Phone</label>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
              placeholder="e.g. +91 98765 43210" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
              placeholder="e.g. info@gym.com" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Address</label>
          <input value={form.address} onChange={(e) => set('address', e.target.value)}
            placeholder="Street / building" className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>City</label>
            <input value={form.city} onChange={(e) => set('city', e.target.value)}
              placeholder="e.g. Mumbai" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>State</label>
            <input value={form.state} onChange={(e) => set('state', e.target.value)}
              placeholder="e.g. Maharashtra" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>GST Number</label>
          <input value={form.gstNumber} onChange={(e) => set('gstNumber', e.target.value.toUpperCase())}
            placeholder="e.g. 27AAPFU0939F1ZV" className={inputCls} maxLength={15} />
          <p className="mt-1 text-xs text-slate-400">Leave blank if not GST registered.</p>
        </div>
      </div>

      {/* Invoice Footer */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-900">Invoice Footer</h3>
        <div>
          <label className={labelCls}>Footer Note</label>
          <textarea
            value={form.invoiceFooter}
            onChange={(e) => set('invoiceFooter', e.target.value)}
            rows={3}
            placeholder="e.g. Thank you for your membership! Contact us at reception for any queries."
            className={`${inputCls} resize-none`}
          />
          <p className="mt-1 text-xs text-slate-400">Appears at the bottom of every invoice.</p>
        </div>
      </div>

      {/* Preview hint */}
      <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-center text-xs text-slate-400">
        To preview an invoice, go to <strong>Subscriptions</strong> → any row → <strong>View Invoice</strong>.
      </div>
    </div>
  );
};

export default InvoiceSettings;
