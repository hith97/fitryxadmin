import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Dumbbell, Target, ClipboardList,
  Tag, RefreshCw, CreditCard, Receipt, CalendarCheck, BookOpen,
  BookMarked, BarChart2, Bell, Settings,
  Download, X, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NavSection = ({ title, items, mobile, onClose }) => (
  <div className="mb-6">
    <h4 className="px-4 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
      {title}
    </h4>
    <nav className="space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          onClick={mobile ? onClose : undefined}
          className={({ isActive }) =>
            `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
          }
        >
          <item.icon size={18} />
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  </div>
);

const Sidebar = ({ mobile = false, onClose }) => {
  const { currentUser } = useAuth();
  const businessName = currentUser?.business?.name || 'Fitryx';
  const businessCategory = currentUser?.business?.category || 'Gym';
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const sections = [
    ...(isSuperAdmin
      ? [
          {
            title: 'SUPER ADMIN',
            items: [
              { label: 'Business Approvals', path: '/admin/partners', icon: ShieldCheck },
            ],
          },
        ]
      : []),
    {
      title: 'MANAGING',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Classes', path: '/classes', icon: BookOpen },
        { label: 'Members', path: '/members', icon: Users },
        { label: 'Staff & Trainers', path: '/staff', icon: UserCheck },
        { label: 'PT Collections', path: '/pt-collections', icon: Dumbbell },
        { label: 'Leads', path: '/leads', icon: Target },
        { label: 'Plans', path: '/plans', icon: ClipboardList },
        { label: 'Offers', path: '/offers', icon: Tag },
        { label: 'Subscriptions', path: '/subscriptions', icon: RefreshCw },
      ]
    },
    {
      title: 'BILLING',
      items: [
        { label: 'Billing', path: '/billing', icon: CreditCard },
        { label: 'Expenses', path: '/expenses', icon: Receipt },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
        { label: 'Libraries', path: '/libraries', icon: BookMarked },
        { label: 'Reports', path: '/reports', icon: BarChart2 },
        { label: 'Push Notifications', path: '/notifications', icon: Bell },
        { label: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className={`${mobile ? 'block h-full' : 'fixed hidden h-full lg:block'} left-0 top-0 w-[220px] bg-white border-r border-border overflow-y-auto z-40`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] text-gray-400 font-medium uppercase mb-0.5 ml-1">Managing {businessName}</div>
            <h1 className="text-xl font-bold text-gray-900 ml-1">fitryx admin</h1>
            <div className="mt-2 ml-1 inline-flex rounded-full bg-primary-light px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              {businessCategory}
            </div>
          </div>

          {mobile ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="py-6 overflow-y-auto">
        {sections.map(section => (
          <NavSection key={section.title} title={section.title} items={section.items} mobile={mobile} onClose={onClose} />
        ))}
      </div>

      <div className="p-4 mt-auto border-t border-border">
        <button className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
          <Download size={16} />
          <span>Install App</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
