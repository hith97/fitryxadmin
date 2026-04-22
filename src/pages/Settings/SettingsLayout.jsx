import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Activity,
  Bell,
  Building2,
  CreditCard,
  FileText,
  MapPin,
  MessageCircle,
  Settings,
  User2,
  Wallet,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Gym Profile',       path: '/settings/profile',          icon: Building2 },
  { label: 'Locations',         path: '/settings/locations',        icon: MapPin },
  { label: 'Account Settings',  path: '/settings/account',          icon: User2 },
  { label: 'Activity Log',      path: '/settings/activity',         icon: Activity },
  { label: 'Invoice Settings',  path: '/settings/invoice',          icon: FileText },
  { label: 'Payment Gateway',   path: '/settings/payment-gateway',  icon: CreditCard },
  { label: 'WhatsApp',          path: '/settings/whatsapp',         icon: MessageCircle },
  { label: 'Billing & Plan',    path: '/settings/billing',          icon: Wallet },
  { label: 'Notifications',     path: '/settings/notifications',    icon: Bell },
  { label: 'Import Data',       path: '/settings/import',           icon: Settings },
];

const SettingsLayout = () => (
  <div className="max-w-[1200px] mx-auto pb-12">
    {/* Page header */}
    <div className="mb-8">
      <h1 className="text-[2rem] font-bold tracking-tight text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your gym and account preferences</p>
    </div>

    <div className="flex gap-6 items-start">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm sticky top-6">
        <nav className="space-y-0.5">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-light text-primary font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  </div>
);

export default SettingsLayout;
