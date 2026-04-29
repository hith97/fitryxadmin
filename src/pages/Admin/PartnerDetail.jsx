import React, { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Clock3, Image as ImageIcon, Mail, MapPin, Pause, Pencil, Phone, RefreshCw, ShieldCheck, Tag, Trash2, UserCheck, UserX } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { adminApi } from '../../services/adminApi';
import { getAmenityConfig } from '../../config/amenities';
import {
  getBusinessName,
  getCategory,
  getEmail,
  getImageUrls,
  getOwnerName,
  getPartnerId,
  getPhone,
  getPrimaryBusiness,
  getStatus,
  getSubcategories,
  normalizePartnerDetail,
} from './partnerUtils';
import { PartnerStatusBadge } from './Partners';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

const SectionCard = ({ icon, title, subtitle, children }) => (
  <div className="card border-slate-200 p-6">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
        {React.createElement(icon, { size: 20 })}
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
    <div className="mt-6">{children}</div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
    <span className="text-sm font-medium text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-800 text-right">{value || '—'}</span>
  </div>
);

const EditModal = ({ partner, onClose, onSaved }) => {
  const [form, setForm] = useState({
    ownerName: getOwnerName(partner) || '',
    businessName: getBusinessName(partner) || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.editPartner(getPartnerId(partner), form);
      toast.success('Partner updated.');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Edit Partner</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Business Name</label>
            <input value={form.businessName} onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Owner Name</label>
            <input value={form.ownerName} onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1 rounded-2xl" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 rounded-2xl" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PartnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  const fetchPartner = async () => {
    setLoading(true);
    try {
      const [payload, sub] = await Promise.allSettled([
        adminApi.getPartnerById(id),
        adminApi.getPartnerSubscription(id),
      ]);
      if (payload.status === 'fulfilled') setPartner(normalizePartnerDetail(payload.value));
      else toast.error(payload.reason?.message);
      if (sub.status === 'fulfilled') setSubscription(sub.value);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPartner(); }, [id]); // eslint-disable-line

  const runAction = async (nextAction) => {
    const partnerId = getPartnerId(partner) || id;
    if (!window.confirm(`Are you sure you want to ${nextAction} ${getBusinessName(partner)}?`)) return;
    setAction(nextAction);
    try {
      if (nextAction === 'approve') await adminApi.approvePartner(partnerId);
      else if (nextAction === 'reject') await adminApi.rejectPartner(partnerId);
      else if (nextAction === 'suspend') await adminApi.suspendPartner(partnerId);
      else if (nextAction === 'pause') await adminApi.pausePartner(partnerId);
      else if (nextAction === 'delete') {
        await adminApi.deletePartner(partnerId);
        toast.success('Partner deleted.');
        navigate('/admin/partners');
        return;
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
  const business = getPrimaryBusiness(partner) || {};
  const images = partner ? getImageUrls(partner) : [];
  const timings = business?.timings || business?.hours || {};
  const subcategories = getSubcategories(partner);
  const categoryName = getCategory(partner);
  const amenityConfig = getAmenityConfig(categoryName);
  const enabledAmenities = business?.amenities || {};

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
            <RefreshCw size={18} /> Refresh
          </Button>
          <Button variant="secondary" className="h-12 rounded-2xl px-5" onClick={() => setShowEdit(true)} disabled={!partner}>
            <Pencil size={18} /> Edit
          </Button>
          {status === 'PENDING' && (
            <>
              <Button className="h-12 rounded-2xl px-5" onClick={() => runAction('approve')} disabled={action === 'approve'}>
                <UserCheck size={18} /> Approve
              </Button>
              <Button variant="danger" className="h-12 rounded-2xl px-5" onClick={() => runAction('reject')} disabled={action === 'reject'}>
                <UserX size={18} /> Reject
              </Button>
            </>
          )}
          {status === 'VERIFIED' && (
            <Button variant="secondary" className="h-12 rounded-2xl px-5" onClick={() => runAction('suspend')} disabled={action === 'suspend'}>
              Suspend
            </Button>
          )}
          {(status === 'VERIFIED' || status === 'SUSPENDED') && (
            <Button variant="secondary" className="h-12 rounded-2xl px-5" onClick={() => runAction('pause')} disabled={action === 'pause'}>
              <Pause size={18} /> Pause
            </Button>
          )}
          <Button variant="danger" className="h-12 rounded-2xl px-5" onClick={() => runAction('delete')} disabled={action === 'delete' || !partner}>
            <Trash2 size={18} /> Delete
          </Button>
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

          {/* Platform Subscription */}
          <div className="card border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Platform Subscription</h2>
            {subscription ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Package</div>
                  <div className="mt-1 text-base font-bold text-slate-900">{subscription.package?.name || '—'}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</div>
                  <div className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${subscription.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {subscription.status}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Start Date</div>
                  <div className="mt-1 text-base font-bold text-slate-900">{subscription.startDate ? new Date(subscription.startDate).toLocaleDateString('en-IN') : '—'}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">End Date</div>
                  <div className="mt-1 text-base font-bold text-slate-900">{subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('en-IN') : '—'}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">No active platform subscription.</div>
            )}
          </div>

          <SectionCard icon={Building2} title="Basic Information" subtitle="Partner business profile details from the profile page.">
            <div className="grid gap-3 md:grid-cols-2">
              <InfoRow label="Gym Name" value={getBusinessName(partner)} />
              <InfoRow label="Founded Year" value={business?.foundedYear} />
              <InfoRow label="Phone" value={business?.phone || getPhone(partner)} />
              <InfoRow label="Email" value={business?.email || getEmail(partner)} />
              <InfoRow label="Category" value={categoryName} />
              <InfoRow
                label="Sub-categories"
                value={subcategories.map((item) => item?.label || item?.name || item).join(', ') || '—'}
              />
              <div className="md:col-span-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {business?.description || 'No description added.'}
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={ImageIcon} title="Photos">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Logo</div>
                  {business?.logoUrl ? (
                    <img src={business.logoUrl} alt="logo" className="h-24 w-24 rounded-2xl border border-slate-200 object-cover" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                      <ImageIcon size={22} />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Cover Image</div>
                  {business?.coverImageUrl ? (
                    <img src={business.coverImageUrl} alt="cover" className="h-24 w-full rounded-2xl border border-slate-200 object-cover" />
                  ) : (
                    <div className="flex h-24 w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                      <ImageIcon size={22} />
                    </div>
                  )}
                </div>
              </div>

              {images.filter((url) => url !== business?.logoUrl && url !== business?.coverImageUrl).length ? (
                <div>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Gallery</div>
                  <div className="flex flex-wrap gap-2">
                    {images
                      .filter((url) => url !== business?.logoUrl && url !== business?.coverImageUrl)
                      .map((url) => (
                        <img key={url} src={url} alt={getBusinessName(partner)} className="h-20 w-20 rounded-2xl border border-slate-200 object-cover" />
                      ))}
                  </div>
                </div>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard icon={MapPin} title="Location">
            <div className="grid gap-3 md:grid-cols-2">
              <InfoRow label="Address" value={business?.address} />
              <InfoRow label="City" value={business?.city} />
              <InfoRow label="State" value={business?.state} />
              <InfoRow label="Pincode" value={business?.pincode} />
            </div>
          </SectionCard>

          <SectionCard icon={Clock3} title="Working Hours">
            <div className="space-y-2">
              {DAYS.map((day) => {
                const value = timings?.[day];
                const display = value?.enabled === false ? 'Closed' : value?.open && value?.close ? `${value.open} - ${value.close}` : '—';
                return (
                  <div key={day} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-700">{day}</span>
                    <span className="text-sm text-slate-500">{display}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard icon={Tag} title={`Amenities — ${categoryName || 'All'}`}>
            <div className="space-y-5">
              {amenityConfig.map(({ section, items }) => {
                const enabled = items.filter(({ key }) => enabledAmenities?.[key]);
                if (!enabled.length) return null;
                return (
                  <div key={section}>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{section}</div>
                    <div className="flex flex-wrap gap-2">
                      {enabled.map(({ key, label }) => (
                        <span key={key} className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
              {Object.values(enabledAmenities).every((value) => !value) ? (
                <div className="rounded-2xl bg-slate-50 py-6 text-center text-sm text-slate-400">
                  No amenities selected yet.
                </div>
              ) : null}
            </div>
          </SectionCard>
        </>
      )}

      {showEdit && partner && (
        <EditModal partner={partner} onClose={() => setShowEdit(false)} onSaved={fetchPartner} />
      )}
    </div>
  );
};

export default PartnerDetail;
