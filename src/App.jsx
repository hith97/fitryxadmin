import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import AppShell from './components/layout/AppShell';
import { AUTH_TOKEN_STORAGE_KEY } from './config/auth';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BranchProvider } from './context/BranchContext';
import { BusinessDataProvider } from './context/BusinessDataContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Partners from './pages/Admin/Partners';
import PartnerDetail from './pages/Admin/PartnerDetail';
import MembersList from './pages/Members/MembersList';
import MemberDetail from './pages/Members/MemberDetail';
import SettingsLayout from './pages/Settings/SettingsLayout';
import ProfileSettings from './pages/Settings/ProfileSettings';
import Locations from './pages/Settings/Locations';
import AccountSettings from './pages/Settings/AccountSettings';
import ActivityLog from './pages/Settings/ActivityLog';
import InvoiceSettings from './pages/Settings/InvoiceSettings';
import PaymentGateway from './pages/Settings/PaymentGateway';
import WhatsApp from './pages/Settings/WhatsApp';
import BillingAndPlan from './pages/Settings/BillingAndPlan';
import NotificationsSettings from './pages/Settings/NotificationsSettings';
import ImportData from './pages/Settings/ImportData';
import Leads from './pages/Leads';
import Plans from './pages/Plans';
import Staff from './pages/Staff';
import Classes from './pages/Classes';
import Subscriptions from './pages/Subscriptions';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminMembers from './pages/Admin/AdminMembers';
import AdminBookings from './pages/Admin/AdminBookings';
import AdminLeads from './pages/Admin/AdminLeads';
import AdminPackages from './pages/Admin/AdminPackages';
import BranchesList from './pages/Branches/BranchesList';
import BranchDetail from './pages/Branches/BranchDetail';

const queryClient = new QueryClient();

const Placeholder = ({ title }) => (
  <div className="card p-12 flex flex-col items-center justify-center text-center">
    <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-500">This page is under construction.</p>
  </div>
);

const FullScreenLoader = () => (
  <div className="min-h-screen bg-page flex items-center justify-center px-6">
    <div className="rounded-[28px] border border-slate-200 bg-white px-8 py-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="mx-auto h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <div className="mt-5 text-sm font-semibold text-slate-700">Loading workspace...</div>
    </div>
  </div>
);

const HomeRedirect = () => {
  const { isAuthenticated, ready } = useAuth();

  if (!ready) {
    return <FullScreenLoader />;
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

const ProtectedRoute = () => {
  const location = useLocation();
  const { currentUser, isAuthenticated, ready } = useAuth();

  if (!ready) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // BRANCH_MANAGER: always allow through (they're pre-verified users)
  if (currentUser?.role === 'BRANCH_MANAGER') {
    return <Outlet />;
  }

  // PARTNER: must complete onboarding + be verified
  if (currentUser?.role === 'PARTNER' && currentUser?.business?.status !== 'VERIFIED') {
    return (
      <Navigate
        to="/register"
        replace
        state={{
          resumeOnboarding: true,
          resumeStep: 5,
          token: localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || '',
          user: currentUser.rawUser,
          partner: currentUser.partner,
          partnerStatus: {
            partner: currentUser.partner,
            verification: {
              phoneVerified: true,
              emailVerified: true,
            },
            hasCompletedOnboarding: true,
          },
        }}
      />
    );
  }

  return <Outlet />;
};

const DashboardRoute = () => {
  const { currentUser } = useAuth();
  return currentUser?.role === 'SUPER_ADMIN' ? <AdminDashboard /> : <Dashboard />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="dashboard" element={<DashboardRoute />} />
          <Route path="admin/partners" element={<Partners />} />
          <Route path="admin/partners/:id" element={<PartnerDetail />} />
          <Route path="admin/members" element={<AdminMembers />} />
          <Route path="admin/bookings" element={<AdminBookings />} />
          <Route path="admin/leads" element={<AdminLeads />} />
          <Route path="admin/packages" element={<AdminPackages />} />
          <Route path="branches" element={<BranchesList />} />
          <Route path="branches/:id" element={<BranchDetail />} />
          <Route path="members" element={<MembersList />} />
          <Route path="members/:id" element={<MemberDetail />} />
          <Route path="members/:id/subscriptions" element={<MemberDetail />} />
          <Route path="leads" element={<Leads />} />
          <Route path="plans" element={<Plans />} />
          <Route path="staff" element={<Staff />} />
          <Route path="pt-collections" element={<Placeholder title="PT Collections" />} />
          <Route path="offers" element={<Placeholder title="Offers" />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="billing" element={<Placeholder title="Billing" />} />
          <Route path="expenses" element={<Placeholder title="Expenses" />} />
          <Route path="attendance" element={<Placeholder title="Attendance" />} />
          <Route path="classes" element={<Classes />} />
          <Route path="libraries" element={<Placeholder title="Libraries" />} />
          <Route path="reports" element={<Placeholder title="Reports" />} />
          <Route path="notifications" element={<Placeholder title="Push Notifications" />} />
          <Route path="settings" element={<Navigate to="/settings/profile" replace />} />
          <Route element={<SettingsLayout />}>
            <Route path="settings/profile"          element={<ProfileSettings />} />
            <Route path="settings/locations"        element={<Locations />} />
            <Route path="settings/account"          element={<AccountSettings />} />
            <Route path="settings/activity"         element={<ActivityLog />} />
            <Route path="settings/invoice"          element={<InvoiceSettings />} />
            <Route path="settings/payment-gateway"  element={<PaymentGateway />} />
            <Route path="settings/whatsapp"         element={<WhatsApp />} />
            <Route path="settings/billing"          element={<BillingAndPlan />} />
            <Route path="settings/notifications"    element={<NotificationsSettings />} />
            <Route path="settings/import"           element={<ImportData />} />
          </Route>
          <Route path="*" element={<Placeholder title="Page Not Found" />} />
        </Route>
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <BranchProvider>
            <BusinessDataProvider>
              <Toaster position="top-right" />
              <AppRoutes />
            </BusinessDataProvider>
          </BranchProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
