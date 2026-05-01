import React, { useRef } from 'react';
import { format } from 'date-fns';
import { Download, Printer, X } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, subscription }) => {
  const printRef = useRef(null);

  if (!isOpen || !subscription) return null;

  const invoiceNum = `INV-${subscription.id?.slice(-8).toUpperCase()}`;
  const createdDate = subscription.createdAt ? format(new Date(subscription.createdAt), 'dd MMM yyyy') : '—';
  const startDate = subscription.startDate ? format(new Date(subscription.startDate), 'dd MMM yyyy') : '—';
  const endDate = subscription.endDate ? format(new Date(subscription.endDate), 'dd MMM yyyy') : '—';
  const amount = subscription.amountPaid ?? 0;
  const discount = subscription.discountAmount ?? 0;
  const subtotal = amount + discount;

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Invoice ${invoiceNum}</title>
      <style>
        body { font-family: sans-serif; margin: 0; padding: 32px; color: #111827; }
        * { box-sizing: border-box; }
        table { width: 100%; border-collapse: collapse; }
        td, th { padding: 10px 12px; font-size: 13px; }
        .text-right { text-align: right; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .bg-gray { background: #f9fafb; }
        .text-sm { font-size: 13px; }
        .text-xs { font-size: 11px; }
        .font-bold { font-weight: 700; }
        .text-primary { color: #6366f1; }
        .text-green { color: #10b981; }
        .text-muted { color: #6b7280; }
      </style>
    </head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Membership Invoice</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Printer size={13} /> Print / PDF
            </button>
            <button onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Invoice content */}
        <div ref={printRef} className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Fitryx" className="h-10 w-auto" onError={(e) => { e.target.style.display = 'none'; }} />
              <div>
                <div className="text-lg font-bold text-slate-900">Fitryx</div>
                <div className="text-xs text-slate-500">Fitness Management Platform</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">INVOICE</div>
              <div className="mt-1 text-xs text-slate-500">#{invoiceNum}</div>
              <div className="mt-0.5 text-xs text-slate-500">Date: {createdDate}</div>
            </div>
          </div>

          {/* Bill to / From */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Bill To</div>
              <div className="font-bold text-slate-900">{subscription.member?.fullName || '—'}</div>
              {subscription.member?.phone && (
                <div className="text-xs text-slate-500 mt-0.5">{subscription.member.phone}</div>
              )}
              {subscription.member?.email && (
                <div className="text-xs text-slate-500">{subscription.member.email}</div>
              )}
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Membership</div>
              <div className="font-bold text-slate-900">{subscription.plan?.name || '—'}</div>
              <div className="text-xs text-slate-500 mt-0.5">Valid: {startDate} – {endDate}</div>
              {subscription.paymentMethod && (
                <div className="text-xs text-slate-500 mt-0.5 capitalize">
                  Payment: {subscription.paymentMethod.replace('_', ' ')}
                </div>
              )}
            </div>
          </div>

          {/* Line items */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Description</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{subscription.plan?.name || 'Membership Plan'}</div>
                  <div className="text-xs text-slate-400">{subscription.plan?.duration}d plan · {startDate} to {endDate}</div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">
                  ₹{subtotal.toLocaleString()}
                </td>
              </tr>
              {discount > 0 && (
                <tr>
                  <td className="px-4 py-3 text-sm text-emerald-600">Discount Applied</td>
                  <td className="px-4 py-3 text-right text-sm text-emerald-600 font-semibold">
                    −₹{discount.toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Total */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-end">
              <div className="w-48 space-y-2">
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span>−₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                  <span>Total Paid</span>
                  <span className="text-primary">₹{amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 rounded-2xl bg-primary/5 px-4 py-3 text-xs text-slate-500 text-center">
            Thank you for your membership! This is a computer-generated invoice. For queries, contact the gym reception.
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
