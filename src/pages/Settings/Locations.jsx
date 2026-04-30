import React from 'react';
import { MapPin, Navigation, Building2, Star, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBranch } from '../../context/BranchContext';

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
    <span className="text-sm font-medium text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-800 text-right">{value || '—'}</span>
  </div>
);

const BranchCard = ({ branch, isSelected, onSwitch, onManage }) => (
  <div className={`rounded-[24px] border bg-white p-5 shadow-sm ${isSelected ? 'border-primary' : 'border-slate-200'}`}>
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <Building2 size={18} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900">{branch.name}</span>
            {branch.isMainBranch && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                <Star size={9} /> Main
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400">
            {branch.city}{branch.state ? `, ${branch.state}` : ''}
          </div>
        </div>
      </div>
      {isSelected && (
        <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">ACTIVE</span>
      )}
    </div>

    <div className="space-y-2">
      <Row label="Address" value={branch.address} />
      <Row label="City" value={branch.city} />
      <Row label="State" value={branch.state} />
      <Row label="Pincode" value={branch.pincode} />
    </div>

    {branch.lat && branch.lng && (
      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-primary-light px-4 py-2.5 text-sm text-primary font-medium">
        <Navigation size={13} />
        GPS: {branch.lat}, {branch.lng}
      </div>
    )}

    <div className="flex gap-2 mt-4">
      <button
        onClick={onManage}
        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
      >
        Manage <ArrowRight size={12} />
      </button>
      {!isSelected && (
        <button
          onClick={onSwitch}
          className="flex-1 rounded-xl bg-primary py-2 text-xs font-semibold text-white hover:bg-primary/90"
        >
          Switch Here
        </button>
      )}
    </div>
  </div>
);

const Locations = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { branches, selectedBranch, selectedBranchId, switchBranch } = useBranch();

  const isPartner = currentUser?.role === 'PARTNER';

  if (!isPartner) {
    const business = currentUser?.business || {};
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your Branch</h2>
          <p className="mt-1 text-sm text-slate-500">The branch you are assigned to manage.</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <MapPin size={18} />
            </div>
            <div>
              <div className="font-semibold text-slate-900">{business.name || 'Your Branch'}</div>
              <div className="text-xs text-slate-400">Assigned branch</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Locations & Branches</h2>
          <p className="mt-1 text-sm text-slate-500">
            {branches.length > 1
              ? `Managing ${branches.length} branch${branches.length > 1 ? 'es' : ''} from one account`
              : 'Your registered business location.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/branches')}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Building2 size={15} />
          Manage Branches
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <MapPin size={32} className="mx-auto text-slate-300 mb-3" />
          <div className="font-semibold text-slate-600">No location data yet</div>
          <div className="mt-1 text-sm text-slate-400">Complete onboarding to see your branch here.</div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              isSelected={branch.id === selectedBranchId}
              onSwitch={() => switchBranch(branch.id)}
              onManage={() => navigate(`/branches/${branch.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Locations;
