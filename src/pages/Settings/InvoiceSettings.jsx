import React from 'react';
import { FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
    <span className="text-sm font-medium text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-800 text-right">{value || '—'}</span>
  </div>
);

const InvoiceSettings = () => {
  const { currentUser } = useAuth();
  const business = currentUser?.business || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Invoice Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Control how invoices and receipts are generated.</p>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Business Details on Invoice</h3>
        <Row label="Business Name"  value={business.name} />
        <Row label="Address"        value={business.address} />
        <Row label="City / State"   value={[business.city, business.state].filter(Boolean).join(', ')} />
        <Row label="Contact Email"  value={business.email} />
        <Row label="Contact Phone"  value={business.phone} />
      </div>

      <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <FileText size={32} className="mx-auto text-slate-300 mb-3" />
        <div className="font-semibold text-slate-600">Custom invoice branding coming soon</div>
        <div className="mt-1 text-sm text-slate-400">
          Add your logo, GST number, and custom footer text to every invoice.
        </div>
      </div>
    </div>
  );
};

export default InvoiceSettings;
