import React, { useCallback, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download } from 'lucide-react';

const LOGO_SIZE_RATIO = 0.22; // logo takes up ~22% of QR width

export default function QRCodeCard({ value, label, size = 180, showDownload = true }) {
  const canvasRef = useRef(null);

  const download = useCallback(() => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Create a new canvas with padding + logo baked in
    const padding = 16;
    const total = size + padding * 2;
    const out = document.createElement('canvas');
    out.width = total;
    out.height = total + (label ? 28 : 0);
    const ctx = out.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, padding, padding, size, size);

    if (label) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, out.width / 2, total + 18);
    }

    const link = document.createElement('a');
    link.download = `${(label || 'qr').replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = out.toDataURL('image/png');
    link.click();
  }, [size, label]);

  if (!value) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={canvasRef} className="relative inline-block">
        <QRCodeCanvas
          value={value}
          size={size}
          bgColor="#ffffff"
          fgColor="#111827"
          level="H"
          imageSettings={{
            src: '/logo.png',
            height: Math.round(size * LOGO_SIZE_RATIO),
            width: Math.round(size * LOGO_SIZE_RATIO),
            excavate: true,
          }}
        />
      </div>
      {label && <p className="text-xs text-gray-500 font-medium text-center max-w-[160px] truncate">{label}</p>}
      {showDownload && (
        <button
          type="button"
          onClick={download}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-primary hover:text-primary transition-colors"
        >
          <Download size={12} />
          Download QR
        </button>
      )}
    </div>
  );
}
