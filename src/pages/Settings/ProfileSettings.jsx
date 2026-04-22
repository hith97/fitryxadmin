import React, { useRef, useState } from 'react';
import {
  Building2, Camera, CheckSquare, Clock3, Image,
  MapPin, Pencil, Plus, Save, Square, Tag, Trash2, Upload, X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { businessApi, uploadApi } from '../../services/planApi';
import { getAmenityConfig } from '../../config/amenities';
import Button from '../../components/ui/Button';

// ── Helpers ────────────────────────────────────────────────────
const inputCls = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white transition-all';
const labelCls = 'mb-2 block text-sm font-semibold text-slate-700';

const Field = ({ label, children }) => (
  <div>
    <label className={labelCls}>{label}</label>
    {children}
  </div>
);

const SectionCard = ({ title, icon: Icon, action, children }) => (
  <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <Icon size={16} />
          </div>
        )}
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
    <span className="text-sm font-medium text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-800 text-right">{value || '—'}</span>
  </div>
);

// ── Days config ────────────────────────────────────────────────
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DEFAULT_TIMINGS = Object.fromEntries(
  DAYS.map((d) => [d, { open: '06:00', close: '22:00', enabled: true }])
);

// ── File upload input with preview ────────────────────────────
const FileUploadInput = ({ value, onChange, onRemove, aspectClass = 'h-32', label }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    onChange(localPreview); // instant local preview
    setUploading(true);
    try {
      const { url } = await uploadApi.uploadImage(file);
      onChange(url); // replace with real server URL
    } catch (err) {
      toast.error(err.message || 'Upload failed');
      onChange(value); // revert
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>}
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="preview"
            className={`w-full rounded-2xl object-cover border border-slate-200 ${aspectClass}`}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-slate-50"
            >
              <Upload size={12} /> Change
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-xl bg-rose-500 p-1.5 text-white shadow hover:bg-rose-600"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-primary hover:text-primary ${aspectClass} ${uploading ? 'opacity-60' : ''}`}
        >
          {uploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <>
              <Upload size={20} />
              <span className="text-xs font-medium">Click to upload</span>
            </>
          )}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
    </div>
  );
};

// ── Amenity toggle ─────────────────────────────────────────────
const AmenityToggle = ({ label, checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all ${
      checked
        ? 'border-primary bg-primary-light text-primary'
        : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40'
    }`}
  >
    {checked ? <CheckSquare size={15} /> : <Square size={15} className="text-slate-300" />}
    {label}
  </button>
);

// ── Main component ─────────────────────────────────────────────
const ProfileSettings = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null); // 'basic' | 'images' | 'location' | 'hours' | 'amenities'
  const [form, setForm] = useState(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['business-profile'],
    queryFn: businessApi.getProfile,
  });

  const mutation = useMutation({
    mutationFn: (payload) => businessApi.updateProfile(payload),
    onSuccess: () => {
      toast.success('Profile updated.');
      queryClient.invalidateQueries({ queryKey: ['business-profile'] });
      setEditing(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const startEdit = (section) => {
    if (!profile) return;
    const timings = profile.timings || DEFAULT_TIMINGS;
    setForm({
      // Basic — fall back to partner's registered contact if business fields are blank
      name: profile.name ?? '',
      phone: profile.phone || profile.partner?.phone || '',
      email: profile.email || profile.partner?.email || '',
      description: profile.description ?? '',
      foundedYear: profile.foundedYear ?? '',
      // Images
      logoUrl: profile.logoUrl ?? '',
      coverImageUrl: profile.coverImageUrl ?? '',
      images: profile.images?.length ? profile.images : [''],
      // Location
      address: profile.address ?? '',
      city: profile.city ?? '',
      state: profile.state ?? '',
      pincode: profile.pincode ?? '',
      // Hours
      timings: typeof timings === 'object' ? timings : DEFAULT_TIMINGS,
      // Amenities
      amenities: profile.amenities || {},
    });
    setEditing(section);
  };

  const save = () => mutation.mutate(form);

  const setField = (f, v) => setForm((prev) => ({ ...prev, [f]: v }));

  const categoryName = profile?.category?.name ?? '';
  const amenityConfig = getAmenityConfig(categoryName);
  const subcats = profile?.subcategories?.map((s) => s.subcategory?.name).filter(Boolean) ?? [];

  if (isLoading) return <div className="py-20 text-center text-sm text-slate-400">Loading profile...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gym Profile</h2>
          <p className="mt-1 text-sm text-slate-500">Edit your gym's public profile and business details.</p>
        </div>
      </div>

      {/* ── BASIC INFO ── */}
      <SectionCard
        title="Basic Information"
        icon={Building2}
        action={
          editing === 'basic' ? (
            <div className="flex gap-2">
              <Button variant="secondary" className="h-8 rounded-xl px-3 text-xs" onClick={() => setEditing(null)}>Cancel</Button>
              <Button className="h-8 rounded-xl px-3 text-xs" onClick={save} disabled={mutation.isPending}>
                <Save size={12} /> Save
              </Button>
            </div>
          ) : (
            <Button variant="secondary" className="h-8 rounded-xl px-3 text-xs" onClick={() => startEdit('basic')}>
              <Pencil size={12} /> Edit
            </Button>
          )
        }
      >
        {editing === 'basic' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Gym Name">
              <input value={form.name} onChange={(e) => setField('name', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Founded Year">
              <input type="number" min="1900" max={new Date().getFullYear()} value={form.foundedYear}
                onChange={(e) => setField('foundedYear', e.target.value)}
                placeholder="e.g. 2015" className={inputCls} />
            </Field>
            <Field label="Contact Phone">
              <input value={form.phone} onChange={(e) => setField('phone', e.target.value)}
                placeholder={profile?.partner?.phone || '+91 9876543210'} className={inputCls} />
              {profile?.partner?.phone && (
                <p className="mt-1 text-xs text-slate-400">Registered: {profile.partner.phone}</p>
              )}
            </Field>
            <Field label="Contact Email">
              <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)}
                placeholder={profile?.partner?.email || 'gym@example.com'} className={inputCls} />
              {profile?.partner?.email && (
                <p className="mt-1 text-xs text-slate-400">Registered: {profile.partner.email}</p>
              )}
            </Field>
            <Field label="Description">
              <textarea value={form.description} onChange={(e) => setField('description', e.target.value)}
                rows={3} placeholder="Describe your gym..." className={`${inputCls} resize-none md:col-span-2`} />
            </Field>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <InfoRow label="Gym Name"       value={profile?.name} />
            <InfoRow label="Founded Year"   value={profile?.foundedYear} />
            <InfoRow label="Phone"          value={profile?.phone || profile?.partner?.phone} />
            <InfoRow label="Email"          value={profile?.email || profile?.partner?.email} />
            <InfoRow label="Category"       value={categoryName} />
            <InfoRow label="Sub-categories" value={subcats.join(', ') || '—'} />
            {profile?.description && (
              <div className="md:col-span-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {profile.description}
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* ── IMAGES ── */}
      <SectionCard
        title="Photos"
        icon={Image}
        action={
          editing === 'images' ? (
            <div className="flex gap-2">
              <Button variant="secondary" className="h-8 rounded-xl px-3 text-xs" onClick={() => setEditing(null)}>Cancel</Button>
              <Button className="h-8 rounded-xl px-3 text-xs" onClick={save} disabled={mutation.isPending}>
                <Save size={12} /> Save
              </Button>
            </div>
          ) : (
            <Button variant="secondary" className="h-8 rounded-xl px-3 text-xs" onClick={() => startEdit('images')}>
              <Pencil size={12} /> Edit
            </Button>
          )
        }
      >
        {editing === 'images' ? (
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-3">
              {/* Logo */}
              <FileUploadInput
                label="Logo"
                value={form.logoUrl}
                onChange={(v) => setField('logoUrl', v)}
                aspectClass="h-32"
                onRemove={() => setField('logoUrl', '')}
              />
              {/* Cover */}
              <div className="md:col-span-2">
                <FileUploadInput
                  label="Cover Image"
                  value={form.coverImageUrl}
                  onChange={(v) => setField('coverImageUrl', v)}
                  aspectClass="h-32"
                  onRemove={() => setField('coverImageUrl', '')}
                />
              </div>
            </div>

            {/* Gallery */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Gallery</p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {form.images.map((url, i) => (
                  <FileUploadInput
                    key={i}
                    value={url}
                    onChange={(v) => {
                      const next = [...form.images];
                      next[i] = v;
                      setField('images', next);
                    }}
                    aspectClass="h-24"
                    onRemove={() => setField('images', form.images.filter((_, idx) => idx !== i))}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setField('images', [...form.images, ''])}
                  className="flex h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary hover:text-primary transition-colors"
                >
                  <Plus size={16} />
                  <span className="text-[11px] font-medium">Add</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Logo */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Logo</div>
                {profile?.logoUrl ? (
                  <img src={profile.logoUrl} alt="logo" className="h-24 w-24 rounded-2xl object-cover border border-slate-200" />
                ) : (
                  <div className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-2xl bg-slate-100 text-slate-300">
                    <Camera size={22} />
                    <span className="text-[10px]">No logo</span>
                  </div>
                )}
              </div>
              {/* Cover */}
              <div className="md:col-span-2 flex flex-col gap-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Cover Image</div>
                {profile?.coverImageUrl ? (
                  <img src={profile.coverImageUrl} alt="cover" className="h-24 w-full rounded-2xl object-cover border border-slate-200" />
                ) : (
                  <div className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-2xl bg-slate-100 text-slate-300">
                    <Image size={24} />
                    <span className="text-[10px]">No cover image</span>
                  </div>
                )}
              </div>
            </div>
            {/* Gallery */}
            {profile?.images?.filter(Boolean).length > 0 && (
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Gallery</div>
                <div className="flex flex-wrap gap-2">
                  {profile.images.filter(Boolean).map((url, i) => (
                    <img key={i} src={url} alt={`gallery-${i}`}
                      className="h-20 w-20 rounded-2xl object-cover border border-slate-200" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* ── LOCATION ── */}
      <SectionCard
        title="Location"
        icon={MapPin}
        action={
          editing === 'location' ? (
            <div className="flex gap-2">
              <Button variant="secondary" className="h-8 rounded-xl px-3 text-xs" onClick={() => setEditing(null)}>Cancel</Button>
              <Button className="h-8 rounded-xl px-3 text-xs" onClick={save} disabled={mutation.isPending}>
                <Save size={12} /> Save
              </Button>
            </div>
          ) : (
            <Button variant="secondary" className="h-8 rounded-xl px-3 text-xs" onClick={() => startEdit('location')}>
              <Pencil size={12} /> Edit
            </Button>
          )
        }
      >
        {editing === 'location' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Address">
              <input value={form.address} onChange={(e) => setField('address', e.target.value)}
                placeholder="Street / Area" className={`${inputCls} md:col-span-2`} />
            </Field>
            <Field label="City">
              <input value={form.city} onChange={(e) => setField('city', e.target.value)}
                placeholder="Mumbai" className={inputCls} />
            </Field>
            <Field label="State">
              <input value={form.state} onChange={(e) => setField('state', e.target.value)}
                placeholder="Maharashtra" className={inputCls} />
            </Field>
            <Field label="Pincode">
              <input value={form.pincode} onChange={(e) => setField('pincode', e.target.value)}
                placeholder="400001" className={inputCls} />
            </Field>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <InfoRow label="Address" value={profile?.address} />
            <InfoRow label="City"    value={profile?.city} />
            <InfoRow label="State"   value={profile?.state} />
            <InfoRow label="Pincode" value={profile?.pincode} />
          </div>
        )}
      </SectionCard>

      {/* ── WORKING HOURS ── */}
      <SectionCard
        title="Working Hours"
        icon={Clock3}
        action={
          editing === 'hours' ? (
            <div className="flex gap-2">
              <Button variant="secondary" className="h-8 rounded-xl px-3 text-xs" onClick={() => setEditing(null)}>Cancel</Button>
              <Button className="h-8 rounded-xl px-3 text-xs" onClick={save} disabled={mutation.isPending}>
                <Save size={12} /> Save
              </Button>
            </div>
          ) : (
            <Button variant="secondary" className="h-8 rounded-xl px-3 text-xs" onClick={() => startEdit('hours')}>
              <Pencil size={12} /> Edit
            </Button>
          )
        }
      >
        {editing === 'hours' ? (
          <div className="space-y-2">
            {DAYS.map((day) => {
              const t = form.timings[day] || { open: '06:00', close: '22:00', enabled: true };
              const update = (key, val) => setField('timings', {
                ...form.timings,
                [day]: { ...t, [key]: val },
              });
              return (
                <div key={day} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => update('enabled', !t.enabled)}
                    className={`h-5 w-5 shrink-0 rounded border-2 transition-colors ${
                      t.enabled ? 'border-primary bg-primary' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {t.enabled && <span className="flex h-full items-center justify-center text-[10px] text-white">✓</span>}
                  </button>
                  <span className={`w-24 text-sm font-semibold ${t.enabled ? 'text-slate-800' : 'text-slate-400'}`}>{day}</span>
                  {t.enabled ? (
                    <>
                      <input type="time" value={t.open} onChange={(e) => update('open', e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary" />
                      <span className="text-sm text-slate-400">to</span>
                      <input type="time" value={t.close} onChange={(e) => update('close', e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary" />
                    </>
                  ) : (
                    <span className="text-sm text-slate-400">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {DAYS.map((day) => {
              const t = profile?.timings?.[day];
              return (
                <div key={day} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-semibold text-slate-700">{day}</span>
                  <span className="text-sm text-slate-500">
                    {t?.enabled === false ? (
                      <span className="text-slate-300">Closed</span>
                    ) : t ? `${t.open} – ${t.close}` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ── AMENITIES ── */}
      <SectionCard
        title={`Amenities — ${categoryName || 'All'}`}
        icon={Tag}
        action={
          editing === 'amenities' ? (
            <div className="flex gap-2">
              <Button variant="secondary" className="h-8 rounded-xl px-3 text-xs" onClick={() => setEditing(null)}>Cancel</Button>
              <Button className="h-8 rounded-xl px-3 text-xs" onClick={save} disabled={mutation.isPending}>
                <Save size={12} /> Save
              </Button>
            </div>
          ) : (
            <Button variant="secondary" className="h-8 rounded-xl px-3 text-xs" onClick={() => startEdit('amenities')}>
              <Pencil size={12} /> Edit
            </Button>
          )
        }
      >
        {editing === 'amenities' ? (
          <div className="space-y-6">
            {amenityConfig.map(({ section, items }) => (
              <div key={section}>
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{section}</div>
                <div className="flex flex-wrap gap-2">
                  {items.map(({ key, label }) => (
                    <AmenityToggle
                      key={key}
                      label={label}
                      checked={!!form.amenities[key]}
                      onChange={(v) => setField('amenities', { ...form.amenities, [key]: v })}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {amenityConfig.map(({ section, items }) => {
              const enabled = items.filter(({ key }) => profile?.amenities?.[key]);
              if (enabled.length === 0) return null;
              return (
                <div key={section}>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{section}</div>
                  <div className="flex flex-wrap gap-2">
                    {enabled.map(({ label }) => (
                      <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
            {!profile?.amenities || Object.values(profile.amenities).every((v) => !v) ? (
              <div className="rounded-2xl bg-slate-50 py-6 text-center text-sm text-slate-400">
                No amenities selected yet — click Edit to add them.
              </div>
            ) : null}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default ProfileSettings;
