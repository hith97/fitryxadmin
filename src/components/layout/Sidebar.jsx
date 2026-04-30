import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, Package, Target,
  CalendarCheck, Settings, X, Download, BookOpen,
  UserCheck, Dumbbell, ClipboardList, Tag, RefreshCw,
  CreditCard, Receipt, BookMarked, BarChart2, Bell, Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranch } from '../../context/BranchContext';

const NavSection = ({ title, items, mobile, onClose }) => (
  <div className="mb-6">
    <h4 className="px-4 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{title}</h4>
    <nav className="space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          onClick={mobile ? onClose : undefined}
          className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
        >
          <item.icon size={18} />
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>
          )}
        </NavLink>
      ))}
    </nav>
  </div>
);

const ADMIN_SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'PARTNERS',
    items: [
      { label: 'Business Approvals', path: '/admin/partners', icon: ShieldCheck },
      { label: 'Packages', path: '/admin/packages', icon: Package },
    ],
  },
  {
    title: 'PLATFORM DATA',
    items: [
      { label: 'All Members', path: '/admin/members', icon: Users },
      { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
      { label: 'Leads', path: '/admin/leads', icon: Target },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

const PARTNER_SECTIONS = [
  {
    title: 'MANAGING',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Branches', path: '/branches', icon: Building2 },
      { label: 'Classes', path: '/classes', icon: BookOpen },
      { label: 'Members', path: '/members', icon: Users },
      { label: 'Staff & Trainers', path: '/staff', icon: UserCheck },
      { label: 'PT Collections', path: '/pt-collections', icon: Dumbbell },
      { label: 'Leads', path: '/leads', icon: Target },
      { label: 'Plans', path: '/plans', icon: ClipboardList },
      { label: 'Offers', path: '/offers', icon: Tag },
      { label: 'Subscriptions', path: '/subscriptions', icon: RefreshCw },
    ],
  },
  {
    title: 'BILLING',
    items: [
      { label: 'Billing', path: '/billing', icon: CreditCard },
      { label: 'Expenses', path: '/expenses', icon: Receipt },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
      { label: 'Libraries', path: '/libraries', icon: BookMarked },
      { label: 'Reports', path: '/reports', icon: BarChart2 },
      { label: 'Push Notifications', path: '/notifications', icon: Bell },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

// Branch managers see a restricted set of nav items (no branch management itself)
const BRANCH_MANAGER_SECTIONS = [
  {
    title: 'MANAGING',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Classes', path: '/classes', icon: BookOpen },
      { label: 'Members', path: '/members', icon: Users },
      { label: 'Staff & Trainers', path: '/staff', icon: UserCheck },
      { label: 'Leads', path: '/leads', icon: Target },
      { label: 'Plans', path: '/plans', icon: ClipboardList },
      { label: 'Subscriptions', path: '/subscriptions', icon: RefreshCw },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
      { label: 'Reports', path: '/reports', icon: BarChart2 },
    ],
  },
];

const Sidebar = ({ mobile = false, onClose }) => {
  const { currentUser } = useAuth();
  const { selectedBranch, isMultiBranch } = useBranch();

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isBranchManager = currentUser?.role === 'BRANCH_MANAGER';
  const isPartner = currentUser?.role === 'PARTNER';

  let sections;
  let displayName;
  let displayCategory;

  if (isSuperAdmin) {
    sections = ADMIN_SECTIONS;
    displayName = 'Fitryx Platform';
    displayCategory = 'Super Admin';
  } else if (isBranchManager) {
    sections = BRANCH_MANAGER_SECTIONS;
    displayName = selectedBranch?.name || 'Branch';
    displayCategory = 'Branch Manager';
  } else {
    sections = PARTNER_SECTIONS;
    displayName = selectedBranch?.name || currentUser?.business?.name || 'Fitryx';
    displayCategory = isMultiBranch ? `${selectedBranch?.city || 'Branch'}` : (currentUser?.business?.category || 'Gym');
  }

  return (
    <aside className={`${mobile ? 'block h-full' : 'fixed hidden h-full lg:block'} left-0 top-0 w-[220px] bg-white border-r border-border overflow-y-auto z-40`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] text-gray-400 font-medium uppercase mb-0.5 ml-1">
              {isSuperAdmin ? 'Platform' : isBranchManager ? 'Branch Access' : `Managing ${isMultiBranch ? 'Multi-Branch' : displayName}`}
            </div>
            <h1 className="text-xl font-bold text-gray-900 ml-1">fitryx admin</h1>
            <div className="mt-2 ml-1 inline-flex rounded-full bg-primary-light px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              {displayCategory}
            </div>
          </div>
          {mobile ? (
            <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100">
              <X size={18} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="py-6 overflow-y-auto">
        {sections.map((section) => (
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
