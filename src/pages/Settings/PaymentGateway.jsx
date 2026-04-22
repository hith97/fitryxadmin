import React from 'react';
import { CreditCard, IndianRupee, Zap } from 'lucide-react';

const GatewayCard = ({ name, description, icon: Icon, badge }) => (
  <div className="flex items-start justify-between gap-4 rounded-[22px] border border-slate-200 bg-white p-5">
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Icon size={20} />
      </div>
      <div>
        <div className="font-semibold text-slate-900">{name}</div>
        <div className="mt-0.5 text-sm text-slate-400">{description}</div>
      </div>
    </div>
    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
      {badge}
    </span>
  </div>
);

const PaymentGateway = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-slate-900">Payment Gateway</h2>
      <p className="mt-1 text-sm text-slate-500">Connect a payment provider to accept online payments.</p>
    </div>

    <div className="space-y-3">
      <GatewayCard
        icon={IndianRupee}
        name="Razorpay"
        description="Accept UPI, cards, and net banking via Razorpay."
        badge="Coming soon"
      />
      <GatewayCard
        icon={Zap}
        name="Cashfree"
        description="Low-fee payment gateway built for India."
        badge="Coming soon"
      />
      <GatewayCard
        icon={CreditCard}
        name="Stripe"
        description="International card payments and subscriptions."
        badge="Coming soon"
      />
    </div>

    <div className="rounded-[24px] border border-primary/20 bg-primary-light p-5 text-sm text-primary">
      <strong>Note:</strong> Manual payment tracking (cash, UPI, bank transfer) is already available on every
      subscription and membership.
    </div>
  </div>
);

export default PaymentGateway;
