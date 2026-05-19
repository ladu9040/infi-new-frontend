import { useState } from 'react';
import { X, MessageCircle, Mail, MessageSquare, Link2, Check, ExternalLink } from 'lucide-react';

interface TripSlipShareModalProps {
  open: boolean;
  onClose: () => void;
  slipToken: string;
  tripId: string;
  indentNumber?: string;
  pickup?: string;
  drop?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverNumber?: string;
}

export const TripSlipShareModal = ({
  open,
  onClose,
  slipToken,
  tripId,
  indentNumber,
  pickup,
  drop,
  vehicleNumber,
  driverName,
  driverNumber,
}: TripSlipShareModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const baseUrl = window.location.origin;
  const slipUrl = `${baseUrl}/t/${slipToken}`;

  const message = [
    `🚛 Trip Slip — ${tripId}`,
    indentNumber ? `Indent: ${indentNumber}` : null,
    pickup && drop ? `Route: ${pickup} → ${drop}` : null,
    vehicleNumber ? `Vehicle: ${vehicleNumber}` : null,
    driverName ? `Driver: ${driverName}${driverNumber ? ` (${driverNumber})` : ''}` : null,
    '',
    `View full slip / QR: ${slipUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

  const enc = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${enc}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`Trip Slip ${tripId}`)}&body=${enc}`;
  const smsUrl = `sms:?body=${enc}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(slipUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = slipUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openInNew = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Share Trip Slip</h2>
            <p className="text-xs text-gray-500 mt-0.5">{tripId} {indentNumber && `· ${indentNumber}`}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Link preview */}
        <div className="px-6 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Shareable Link
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={slipUrl}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-mono truncate"
              onFocus={(e) => e.target.select()}
            />
            <button
              onClick={copyLink}
              className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                copied
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-800 text-white hover:bg-gray-900'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Anyone with this link can view the trip slip — no login required.
          </p>
        </div>

        {/* Share targets */}
        <div className="p-6 grid grid-cols-3 gap-3">
          <button
            onClick={() => openInNew(whatsappUrl)}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition group"
          >
            <div className="w-11 h-11 bg-green-500 rounded-full flex items-center justify-center text-white group-hover:scale-105 transition">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-700">WhatsApp</span>
          </button>

          <button
            onClick={() => openInNew(emailUrl)}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition group"
          >
            <div className="w-11 h-11 bg-blue-500 rounded-full flex items-center justify-center text-white group-hover:scale-105 transition">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-700">Email</span>
          </button>

          <button
            onClick={() => openInNew(smsUrl)}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition group"
          >
            <div className="w-11 h-11 bg-purple-500 rounded-full flex items-center justify-center text-white group-hover:scale-105 transition">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-700">SMS</span>
          </button>
        </div>

        {/* Open slip */}
        <div className="px-6 pb-6">
          <button
            onClick={() => openInNew(slipUrl)}
            className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> Open Slip in New Tab
          </button>
        </div>
      </div>
    </div>
  );
};
