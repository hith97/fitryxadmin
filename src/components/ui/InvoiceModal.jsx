import React, { useRef } from 'react';
import { format } from 'date-fns';
import { Download, Printer, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { businessApi } from '../../services/planApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const InvoiceModal = ({ isOpen, onClose, subscription }) => {
  const printRef = useRef(null);

  const { data: business } = useQuery({
    queryKey: ['business-profile'],
    queryFn: businessApi.getProfile,
    enabled: isOpen,
  });

  if (!isOpen || !subscription) return null;

  const invoiceNum = `INV-${subscription.id?.slice(-8).toUpperCase()}`;
  const createdDate = subscription.createdAt ? format(new Date(subscription.createdAt), 'dd MMM yyyy') : '—';
  const startDate = subscription.startDate ? format(new Date(subscription.startDate), 'dd MMM yyyy') : '—';
  const endDate = subscription.endDate ? format(new Date(subscription.endDate), 'dd MMM yyyy') : '—';
  const amount = subscription.amountPaid ?? 0;
  const discount = subscription.discountAmount ?? 0;
  const subtotal = amount + discount;

  const bizName    = business?.name         || 'Your Business';
  const bizAddress = business?.address      || '';
  const bizCity    = [business?.city, business?.state].filter(Boolean).join(', ');
  const bizPhone   = business?.phone        || '';
  const bizEmail   = business?.email        || '';
  const bizGST     = business?.gstNumber    || '';
  const bizFooter  = business?.invoiceFooter || 'Thank you for your membership! This is a computer-generated invoice.';
  const bizLogo    = business?.logoUrl
    ? (business.logoUrl.startsWith('http') ? business.logoUrl : `${API_BASE_URL}${business.logoUrl}`)
    : null;

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Invoice ${invoiceNum}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; color: #111827; background: #fff; }
        * { box-sizing: border-box; }
        table { width: 100%; border-collapse: collapse; }
        td, th { padding: 10px 14px; font-size: 13px; }
        .text-right { text-align: right; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .bg-gray { background: #f9fafb; }
        .text-sm { font-size: 13px; }
        .text-xs { font-size: 11px; }
        .font-bold { font-weight: 700; }
        .text-primary { color: #6366f1; }
        .text-green { color: #10b981; }
        .text-muted { color: #6b7280; }
        .logo-img { max-height: 48px; max-width: 120px; object-fit: contain; }
        .gst-badge { display: inline-block; background: #f1f5f9; border-radius: 4px; padding: 2px 8px; font-size: 11px; color: #475569; margin-top: 4px; }
      </style>
    </head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-[640px] max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
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
              {bizLogo ? (
                <img src={bizLogo} alt={bizName} className="logo-img h-12 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{bizName.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <div>
                <div className="text-lg font-bold text-slate-900">{bizName}</div>
                {(bizAddress || bizCity) && (
                  <div className="text-xs text-slate-500">{[bizAddress, bizCity].filter(Boolean).join(', ')}</div>
                )}
                {(bizPhone || bizEmail) && (
                  <div className="text-xs text-slate-500">{[bizPhone, bizEmail].filter(Boolean).join(' · ')}</div>
                )}
                {bizGST && (
                  <div className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    GST: {bizGST}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">INVOICE</div>
              <div className="mt-1 text-xs text-slate-500">#{invoiceNum}</div>
              <div className="mt-0.5 text-xs text-slate-500">Date: {createdDate}</div>
            </div>
          </div>

          {/* Bill to / Membership */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Bill To</div>
              <div className="font-bold text-slate-900">{subscription.member?.fullName || '—'}</div>
              {subscription.member?.memberNumber && (
                <div className="mt-0.5 inline-block rounded bg-white border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500">
                  {subscription.member.memberNumber}
                </div>
              )}
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
              {subscription.paymentStatus && subscription.paymentStatus !== 'PAID' && (
                <div className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  {subscription.paymentStatus === 'PARTIAL' ? 'Partial Payment' : 'Pending'}
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
              {subscription.remainingAmount > 0 && (
                <tr>
                  <td className="px-4 py-3 text-sm text-amber-600">
                    Remaining Amount
                    {subscription.nextPaymentDate && (
                      <span className="ml-1 text-xs text-slate-400">
                        (due {format(new Date(subscription.nextPaymentDate), 'dd MMM yyyy')})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-amber-600 font-semibold">
                    ₹{subscription.remainingAmount.toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Total */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-end">
              <div className="w-52 space-y-2">
                {discount > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount</span>
                      <span>−₹{discount.toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                  <span>Amount Paid</span>
                  <span className="text-primary">₹{amount.toLocaleString()}</span>
                </div>
                {subscription.remainingAmount > 0 && (
                  <div className="flex justify-between text-sm font-semibold text-amber-600">
                    <span>Balance Due</span>
                    <span>₹{subscription.remainingAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 rounded-2xl bg-primary/5 px-4 py-3 text-xs text-slate-500 text-center">
            {bizFooter}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
