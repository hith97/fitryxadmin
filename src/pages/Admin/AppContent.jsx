import React, { useEffect, useState } from 'react';
import {
  AtSign, Bell, BookOpen, ExternalLink, Globe,
  Loader2, Lock, MessageSquare, Phone, RefreshCw, Save,
  Send, Settings, Share2, ShieldCheck, Smartphone,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../services/adminApi';

// ── Helpers ──────────────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, description, children, onSave, saving }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
            <Icon size={17} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
          </div>
        </div>
        {onSave && (
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors flex-shrink-0"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors resize-none"
    />
  );
}

function Toggle({ value, onChange, label }) {
  const on = value === 'true' || value === true;
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(on ? 'false' : 'true')}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? 'bg-primary' : 'bg-slate-300'}`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

// ── Sections config ───────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'contact',
    icon: Phone,
    title: 'Contact & Support',
    description: 'Shown to users in the Help & About screens',
    fields: [
      { key: 'contact.email',    label: 'Support Email',    type: 'email',    placeholder: 'support@fitryx.in' },
      { key: 'contact.phone',    label: 'Support Phone',    type: 'text',     placeholder: '+91 98765 43210' },
      { key: 'contact.whatsapp', label: 'WhatsApp Number',  type: 'text',     placeholder: '+91 98765 43210' },
      { key: 'contact.address',  label: 'Company Address',  type: 'textarea', placeholder: '123 Business Park, Ahmedabad, Gujarat 380001' },
    ],
  },
  {
    id: 'social',
    icon: Share2,
    title: 'Social Media',
    description: 'Links shown on the About and Profile screens',
    fields: [
      { key: 'social.instagram', label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/fitryx' },
      { key: 'social.facebook',  label: 'Facebook URL',  type: 'url', placeholder: 'https://facebook.com/fitryx' },
      { key: 'social.youtube',   label: 'YouTube URL',   type: 'url', placeholder: 'https://youtube.com/@fitryx' },
      { key: 'social.twitter',   label: 'Twitter / X URL', type: 'url', placeholder: 'https://x.com/fitryx' },
    ],
  },
  {
    id: 'email',
    icon: AtSign,
    title: 'Email Settings',
    description: 'Sender identity and footer used in all outgoing emails',
    fields: [
      { key: 'email.from_name',    label: 'Sender Name',      type: 'text',  placeholder: 'Fitryx' },
      { key: 'email.from_address', label: 'Sender Email',     type: 'email', placeholder: 'no-reply@fitryx.in' },
      { key: 'email.support_email',label: 'Reply-To / Support', type: 'email', placeholder: 'support@fitryx.in' },
      { key: 'email.footer_text',  label: 'Email Footer Text', type: 'textarea', placeholder: '© 2026 Fitryx. All rights reserved.' },
    ],
  },
  {
    id: 'legal',
    icon: BookOpen,
    title: 'Legal Links',
    description: 'URLs to Terms & Conditions and Privacy Policy (opened in-app browser)',
    fields: [
      { key: 'legal.terms_url',   label: 'Terms & Conditions URL', type: 'url', placeholder: 'https://fitryx.in/terms' },
      { key: 'legal.privacy_url', label: 'Privacy Policy URL',     type: 'url', placeholder: 'https://fitryx.in/privacy' },
    ],
  },
  {
    id: 'app',
    icon: Settings,
    title: 'App Behaviour',
    description: 'Feature toggles and default values used across the mobile app',
    fields: [
      { key: 'app.step_daily_goal',      label: 'Daily Step Goal',         type: 'number',  placeholder: '10000', hint: 'Default target shown in Activity Summary' },
      { key: 'app.coin_per_step',        label: 'Coins Earned per Step',   type: 'number',  placeholder: '0',     hint: 'Set to 0 to disable step-based coins' },
      { key: 'app.referral_enabled',     label: 'Enable Referral Program', type: 'toggle' },
      { key: 'app.referral_reward_coins',label: 'Referral Reward (Coins)', type: 'number',  placeholder: '100' },
      { key: 'app.maintenance_mode',     label: 'Maintenance Mode',        type: 'toggle',  hint: 'When ON, users see a maintenance screen on login' },
      { key: 'app.maintenance_message', label: 'Maintenance Message',     type: 'textarea', placeholder: "We're upgrading Fitryx. Back shortly!" },
    ],
  },
];

// ── Main component ────────────────────────────────────────────────────

export default function AppContent() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  // Push broadcast state
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushSending, setPushSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAppConfig();
      setConfig(data ?? {});
    } catch {
      toast.error('Failed to load app config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const get = (key) => config[key] ?? '';
  const set = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  const saveSection = async (section) => {
    const keys = section.fields.map((f) => f.key);
    const payload = Object.fromEntries(keys.map((k) => [k, get(k)]));
    setSaving((s) => ({ ...s, [section.id]: true }));
    try {
      const updated = await adminApi.setAppConfig(payload);
      setConfig((prev) => ({ ...prev, ...updated }));
      toast.success(`${section.title} saved`);
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving((s) => ({ ...s, [section.id]: false }));
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) { toast.error('Title and message are required'); return; }
    setPushSending(true);
    try {
      const res = await adminApi.broadcastPush(pushTitle.trim(), pushBody.trim());
      toast.success(res.message ?? 'Broadcast sent');
      setPushTitle('');
      setPushBody('');
    } catch (err) {
      toast.error(err.message || 'Broadcast failed');
    } finally {
      setPushSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[860px] space-y-6 pb-10">

      {/* Page header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Smartphone size={13} /> App Content
          </div>
          <h1 className="mt-3 text-[2rem] font-bold tracking-tight text-slate-900">App Content Manager</h1>
          <p className="mt-1 text-sm text-slate-500">Manage contact info, social links, email settings, legal pages, and push notifications.</p>
        </div>
        <button onClick={load} className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Config sections */}
      {SECTIONS.map((section) => (
        <SectionCard
          key={section.id}
          icon={section.icon}
          title={section.title}
          description={section.description}
          onSave={() => saveSection(section)}
          saving={saving[section.id]}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.key} className={field.type === 'textarea' || field.type === 'toggle' ? 'sm:col-span-2' : ''}>
                {field.type === 'toggle' ? (
                  <Toggle value={get(field.key)} onChange={(v) => set(field.key, v)} label={field.label} />
                ) : field.type === 'textarea' ? (
                  <Field label={field.label} hint={field.hint}>
                    <Textarea value={get(field.key)} onChange={(v) => set(field.key, v)} placeholder={field.placeholder} />
                  </Field>
                ) : (
                  <Field label={field.label} hint={field.hint}>
                    <Input type={field.type} value={get(field.key)} onChange={(v) => set(field.key, v)} placeholder={field.placeholder} />
                  </Field>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      ))}

      {/* Push Broadcast */}
      <SectionCard
        icon={Bell}
        title="Push Notification Broadcast"
        description="Send a push notification to all app users at once"
      >
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            This will send a notification to every user who has enabled push notifications. Use sparingly.
          </div>
          <Field label="Notification Title">
            <Input value={pushTitle} onChange={setPushTitle} placeholder="e.g. New gyms near you!" />
          </Field>
          <Field label="Message">
            <Textarea value={pushBody} onChange={setPushBody} placeholder="e.g. Check out the latest gyms and studios added in your area." rows={3} />
          </Field>
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500">
              Preview: <span className="font-semibold text-slate-800">{pushTitle || 'Notification Title'}</span> — {pushBody || 'Your message here…'}
            </div>
            <button
              type="submit"
              disabled={pushSending}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors flex-shrink-0"
            >
              {pushSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {pushSending ? 'Sending…' : 'Broadcast'}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Quick reference */}
      <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-6 py-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Mobile App — Public Config Endpoint</p>
        <code className="text-xs text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 block font-mono">
          GET /public/app-config
        </code>
        <p className="text-xs text-slate-400 mt-2">Contact, social, legal, and app behaviour keys are readable by the mobile app without authentication.</p>
      </div>
    </div>
  );
}
