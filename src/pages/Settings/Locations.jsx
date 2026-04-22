import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
    <span className="text-sm font-medium text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-800 text-right">{value || '—'}</span>
  </div>
);

const Locations = () => {
  const { currentUser } = useAuth();
  const business = currentUser?.business || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Locations</h2>
        <p className="mt-1 text-sm text-slate-500">Your registered business location details.</p>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <MapPin size={18} />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{business.name || 'Your Business'}</div>
            <div className="text-xs text-slate-400">Primary location</div>
          </div>
        </div>

        <div className="space-y-3">
          <Row label="Address"  value={business.address} />
          <Row label="City"     value={business.city} />
          <Row label="State"    value={business.state} />
          <Row label="Pincode"  value={business.pincode} />
        </div>

        {business.lat && business.lng && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-primary-light px-4 py-3 text-sm text-primary font-medium">
            <Navigation size={14} />
            GPS: {business.lat}, {business.lng}
          </div>
        )}
      </div>

      <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <MapPin size={32} className="mx-auto text-slate-300 mb-3" />
        <div className="font-semibold text-slate-600">Multiple locations coming soon</div>
        <div className="mt-1 text-sm text-slate-400">
          You'll be able to manage branches and satellite locations here.
        </div>
      </div>
    </div>
  );
};

export default Locations;
