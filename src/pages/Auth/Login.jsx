import React, { useState } from 'react';
import { ArrowRight, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { partnerApi } from '../../services/partnerApi';
import AuthLayout from './AuthLayout';

const getPartnerResumeStep = (statusPayload) => {
  const partnerStatus = statusPayload?.partner?.status;

  if (partnerStatus === 'VERIFIED') {
    return null;
  }

  const phoneVerified = Boolean(statusPayload?.verification?.phoneVerified);
  const emailVerified = Boolean(statusPayload?.verification?.emailVerified);
  const hasCompletedOnboarding = Boolean(statusPayload?.hasCompletedOnboarding);

  if (!phoneVerified || !emailVerified) {
    return 2;
  }

  if (!hasCompletedOnboarding) {
    return 3;
  }

  return 5;
};

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: location.state?.prefillEmail || '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const result = await login(form);

    if (!result.ok) {
      setSubmitting(false);
      setError(result.error);
      toast.error(result.error);
      return;
    }

    try {
      if (result.user?.role === 'PARTNER') {
        const partnerStatus = await partnerApi.getStatus(result.token);
        const resumeStep = getPartnerResumeStep(partnerStatus);

        if (resumeStep) {
          toast.success('Welcome back. Continue your onboarding.');
          navigate('/register', {
            replace: true,
            state: {
              resumeOnboarding: true,
              resumeStep,
              token: result.token,
              user: result.payload?.user,
              partner: result.payload?.partner,
              partnerStatus,
            },
          });
          return;
        }
      }

      toast.success('Welcome back.');
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (statusError) {
      setError(statusError.message);
      toast.error(statusError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Sign In"
      title="Manage your gym from one dashboard"
      description="Log in to monitor members, track revenue, and complete the approval journey for your business."
    >
      <div className="mx-auto max-w-[520px] rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary-light text-primary">
            <ShieldCheck size={24} />
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Login to your account</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Use your credentials to open the right workspace.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                placeholder="owner@yourbusiness.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

          <Button type="submit" className="h-12 w-full rounded-2xl text-sm font-semibold" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
            <ArrowRight size={16} />
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          New business onboarding?
          {' '}
          <Link className="font-semibold text-primary hover:text-[#5b54d6]" to="/register">
            Create account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
