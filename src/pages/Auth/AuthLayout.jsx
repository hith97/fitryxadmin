import React from 'react';
import { Building2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { authHighlights } from './authData';

const sideIcons = [Sparkles, Building2, ShieldCheck];

const AuthLayout = ({ eyebrow, title, description, children }) => {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f8ff_0%,#f7fafc_100%)]">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[460px_minmax(0,1fr)]">
        <aside className="relative hidden overflow-hidden border-r border-slate-200 bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_100%)] p-10 text-white lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(108,99,255,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.18),transparent_26%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary text-white">F</div>
              Fitryx Admin
            </div>
          </div>

          <div className="relative mt-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary-light">
              {eyebrow}
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight">{title}</h1>
            <p className="mt-4 max-w-[320px] text-base leading-7 text-slate-300">{description}</p>
          </div>

          <div className="relative mt-12 space-y-4">
            {authHighlights.map((item, index) => {
              const Icon = sideIcons[index % sideIcons.length];

              return (
                <div key={item} className="flex gap-3 rounded-[22px] border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-primary-light">
                    <Icon size={20} />
                  </div>
                  <p className="text-sm leading-6 text-slate-200">{item}</p>
                </div>
              );
            })}
          </div>

          <div className="relative mt-auto rounded-[24px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-400" size={20} />
              <div>
                <div className="text-sm font-semibold">Trusted onboarding</div>
                <div className="text-sm text-slate-300">Create your gym profile, verify it, then wait for approval.</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
          <div className="w-full max-w-[860px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
