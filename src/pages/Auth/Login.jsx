import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, KeyRound, Mail, MailCheck, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/authApi';
import { partnerApi } from '../../services/partnerApi';
import AuthLayout from './AuthLayout';

const getPartnerResumeStep = (statusPayload) => {
  if (statusPayload?.partner?.status === 'VERIFIED') return null;
  if (!statusPayload?.verification?.emailVerified) return 2;
  if (!statusPayload?.hasCompletedOnboarding) return 3;
  return 5;
};

// ── Password login ────────────────────────────────────────────────────────────

const PasswordLogin = ({ onSuccess }) => {
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.prefillEmail || '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await login(form);
    if (!result.ok) {
      setSubmitting(false);
      setError(result.error);
      toast.error(result.error);
      return;
    }
    onSuccess(result);
    setSubmitting(false);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
            type={passwordVisible ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setPasswordVisible((v) => !v)}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
          >
            {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
          {error.toLowerCase().includes('verify your email') && (
            <div className="mt-2 font-semibold">
              <Link className="underline" to="/register">Complete verification here</Link>.
            </div>
          )}
        </div>
      )}

      <Button type="submit" className="h-12 w-full rounded-2xl text-sm font-semibold" disabled={submitting}>
        {submitting ? 'Signing in...' : 'Login'}
        <ArrowRight size={16} />
      </Button>
    </form>
  );
};

// ── Email OTP login ───────────────────────────────────────────────────────────

const OTP_STEPS = { EMAIL: 1, CODE: 2, SET_PASSWORD: 3 };
const RESEND_SECONDS = 60;

const OtpLogin = ({ onSuccess }) => {
  const [step, setStep] = useState(OTP_STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loginToken, setLoginToken] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { loginWithOtp } = useAuth();

  const startCountdown = () => {
    setCountdown(RESEND_SECONDS);
    const tick = () => setCountdown((c) => {
      if (c <= 1) return 0;
      setTimeout(tick, 1000);
      return c - 1;
    });
    setTimeout(tick, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Enter your email address.');
    setSubmitting(true);
    setError('');
    try {
      await authApi.sendEmailLoginOtp(email.trim());
      toast.success('OTP sent to your email.');
      setStep(OTP_STEPS.CODE);
      startCountdown();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit code from your email.');
    setSubmitting(true);
    setError('');
    try {
      const payload = await authApi.verifyEmailLoginOtp(email.trim(), code);
      const token = payload.access_token || payload.accessToken || payload.token;
      setLoginToken(token);

      if (payload.isFirstLogin) {
        setStep(OTP_STEPS.SET_PASSWORD);
        setSubmitting(false);
        return;
      }

      const result = loginWithOtp(payload);
      if (!result.ok) throw new Error(result.error);
      onSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setSubmitting(true);
    setError('');
    try {
      await authApi.setPassword(loginToken, password);
      toast.success('Password set! Logging you in…');
      const payload = await authApi.verifyEmailLoginOtp(email.trim(), ''); // re-fetch isn't needed — use loginWithOtp directly
      // We already have the token from the OTP verify step — just finalize login
    } catch { /* ignore — we proceed below */ }

    // Finalize login with the payload we already verified
    try {
      const finalPayload = await authApi.verifyEmailLoginOtp(email.trim(), code);
      const result = loginWithOtp(finalPayload);
      if (!result.ok) throw new Error(result.error);
      onSuccess(result);
    } catch (err) {
      // OTP likely expired, just continue as logged in from saved token
      const result = loginWithOtp({ access_token: loginToken });
      onSuccess(result);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipPassword = () => {
    const result = loginWithOtp({ access_token: loginToken });
    onSuccess(result);
  };

  if (step === OTP_STEPS.EMAIL) {
    return (
      <form className="space-y-5" onSubmit={handleSendOtp}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
              placeholder="owner@yourbusiness.com"
            />
          </div>
        </div>
        {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
        <Button type="submit" className="h-12 w-full rounded-2xl text-sm font-semibold" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send OTP'}
          <ArrowRight size={16} />
        </Button>
      </form>
    );
  }

  if (step === OTP_STEPS.CODE) {
    return (
      <form className="space-y-5" onSubmit={handleVerifyOtp}>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <MailCheck size={20} />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900">Check your inbox</div>
              <div className="mt-1 text-sm text-slate-500">
                OTP sent to <span className="font-semibold text-slate-700">{email}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">6-digit code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-center text-xl font-bold tracking-[0.5em] text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            placeholder="──────"
          />
        </div>

        <div className="text-center text-sm text-slate-500">
          {countdown > 0
            ? `Resend in ${countdown}s`
            : (
              <button
                type="button"
                onClick={async () => {
                  try { await authApi.sendEmailLoginOtp(email.trim()); startCountdown(); toast.success('New OTP sent.'); }
                  catch (err) { toast.error(err.message); }
                }}
                className="font-semibold text-primary hover:underline"
              >
                Resend code
              </button>
            )}
        </div>

        {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" className="h-12 rounded-2xl px-5" onClick={() => { setStep(OTP_STEPS.EMAIL); setCode(''); setError(''); }}>
            Back
          </Button>
          <Button type="submit" className="h-12 flex-1 rounded-2xl text-sm font-semibold" disabled={submitting || code.length < 6}>
            {submitting ? 'Verifying…' : 'Verify & Login'}
            <ArrowRight size={16} />
          </Button>
        </div>
      </form>
    );
  }

  // SET_PASSWORD step
  return (
    <form className="space-y-5" onSubmit={handleSetPassword}>
      <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-700">
        <div className="font-semibold">First login detected</div>
        Set a password so you can log in with email + password next time. You can also skip this.
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">New Password</label>
        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type={passwordVisible ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            placeholder="At least 6 characters"
          />
          <button type="button" onClick={() => setPasswordVisible((v) => !v)}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm Password</label>
        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type={passwordVisible ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            placeholder="Repeat password"
          />
        </div>
      </div>

      {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" className="h-12 rounded-2xl px-5" onClick={handleSkipPassword}>
          Skip
        </Button>
        <Button type="submit" className="h-12 flex-1 rounded-2xl text-sm font-semibold" disabled={submitting}>
          {submitting ? 'Saving…' : 'Set Password & Login'}
          <ArrowRight size={16} />
        </Button>
      </div>
    </form>
  );
};

// ── Main Login page ───────────────────────────────────────────────────────────

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState('password'); // 'password' | 'otp'

  const handleSuccess = async (result) => {
    try {
      if (result.user?.role === 'PARTNER') {
        const partnerStatus = await partnerApi.getStatus(result.token);
        const resumeStep = getPartnerResumeStep(partnerStatus);
        if (resumeStep) {
          toast.success('Welcome back. Continue your onboarding.');
          navigate('/register', {
            replace: true,
            state: { resumeOnboarding: true, resumeStep, token: result.token, user: result.payload?.user, partner: result.payload?.partner, partnerStatus },
          });
          return;
        }
      }
      toast.success('Welcome back.');
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message);
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

        {/* Mode toggle */}
        <div className="mt-6 flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all ${mode === 'password' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setMode('otp')}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all ${mode === 'otp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Email OTP
          </button>
        </div>

        <div className="mt-6">
          {mode === 'password'
            ? <PasswordLogin onSuccess={handleSuccess} />
            : <OtpLogin onSuccess={handleSuccess} />}
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          New business onboarding?{' '}
          <Link className="font-semibold text-primary hover:text-[#5b54d6]" to="/register">
            Create account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
