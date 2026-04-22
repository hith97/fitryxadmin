import React, { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Mail, MapPin, Phone, RefreshCw, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { adminApi } from '../../services/adminApi';
import {
  getAddress,
  getBusinessName,
  getCategory,
  getEmail,
  getImageUrls,
  getOwnerName,
  getPartnerId,
  getPhone,
  getStatus,
  normalizePartnerDetail,
} from './partnerUtils';
import { PartnerStatusBadge } from './Partners';

const DetailCard = ({ icon, title, value, helper }) => (
  <div className="rounded-[24px] border border-slate-200 bg-white p-5">
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
        {React.createElement(icon, { size: 20 })}
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</div>
        <div className="mt-2 text-base font-semibold text-slate-900">{value || 'Not available'}</div>
        {helper ? <div className="mt-1 text-sm text-slate-500">{helper}</div> : null}
      </div>
    </div>
  </div>
);

const PartnerDetail = () => {
  const { id } = useParams();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('');

  const fetchPartner = async () => {
    setLoading(true);

    try {
      const payload = await adminApi.getPartnerById(id);
      setPartner(normalizePartnerDetail(payload));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Loads the selected partner when the route id changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPartner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const runAction = async (nextAction) => {
    const partnerId = getPartnerId(partner) || id;

    if (!window.confirm(`Are you sure you want to ${nextAction} ${getBusinessName(partner)}?`)) {
      return;
    }

    setAction(nextAction);

    try {
      if (nextAction === 'approve') {
        await adminApi.approvePartner(partnerId);
      } else if (nextAction === 'reject') {
        await adminApi.rejectPartner(partnerId);
      } else {
        await adminApi.suspendPartner(partnerId);
      }

      toast.success(`Partner ${nextAction}d.`);
      fetchPartner();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAction('');
    }
  };

  const status = getStatus(partner);
  const images = partner ? getImageUrls(partner) : [];
  const onboarding = partner?.onboarding || partner?.business || partner || {};
  const timings = onboarding?.timings || onboarding?.hours || {};
  const subcategories = partner?.subcategories || onboarding?.subcategories || partner?.sportsTypes || [];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Link to="/admin/partners" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary">
            <ArrowLeft size={16} />
            Back to applications
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <ShieldCheck size={14} />
            Partner Detail
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">{getBusinessName(partner)}</h1>
          <div className="mt-3">
            <PartnerStatusBadge status={status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="h-12 rounded-2xl px-5" onClick={fetchPartner} disabled={loading}>
            <RefreshCw size={18} />
            Refresh
          </Button>
          {status === 'PENDING' ? (
            <>
              <Button className="h-12 rounded-2xl px-5" onClick={() => runAction('approve')} disabled={action === 'approve'}>
                <UserCheck size={18} />
                Approve
              </Button>
              <Button variant="danger" className="h-12 rounded-2xl px-5" onClick={() => runAction('reject')} disabled={action === 'reject'}>
                <UserX size={18} />
                Reject
              </Button>
            </>
          ) : null}
          {status === 'VERIFIED' ? (
            <Button variant="secondary" className="h-12 rounded-2xl px-5" onClick={() => runAction('suspend')} disabled={action === 'suspend'}>
              Suspend
            </Button>
          ) : null}
        </div>
      </div>

      {loading && !partner ? (
        <div className="card p-8 text-center text-sm font-semibold text-slate-500">Loading partner details...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailCard icon={Building2} title="Business" value={getBusinessName(partner)} helper={getCategory(partner)} />
            <DetailCard icon={UserCheck} title="Owner" value={getOwnerName(partner)} />
            <DetailCard icon={Mail} title="Email" value={getEmail(partner)} />
            <DetailCard icon={Phone} title="Phone" value={getPhone(partner)} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="card border-slate-200 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Business Information</h2>
                  <p className="text-sm text-slate-500">Address, description, categories, and configured timings.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Address</div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">{getAddress(partner) || 'Not available'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Description</div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">{onboarding.description || 'Not available'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sub Categories</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {subcategories.length ? (
                      subcategories.map((item) => (
                        <span key={item.id || item.label || item.name || item} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
                          {item.label || item.name || item}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">No sub categories available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900">Business Photos</h2>
              <div className="mt-5 grid gap-3">
                {images.length ? (
                  images.map((url) => (
                    <img key={url} src={url} alt={getBusinessName(partner)} className="h-40 w-full rounded-[18px] object-cover" />
                  ))
                ) : (
                  <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400">
                    No photos uploaded
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900">Working Hours</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {Object.keys(timings).length ? (
                Object.entries(timings).map(([day, value]) => (
                  <div key={day} className="rounded-[18px] bg-slate-50 p-4">
                    <div className="text-sm font-semibold capitalize text-slate-800">{day}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {value ? `${value.open} - ${value.close}` : 'Closed'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400">No working hours available</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PartnerDetail;
