import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={20} className="text-emerald-400" />,
  error:   <XCircle size={20} className="text-rose-400" />,
  info:    <Info size={20} className="text-blue-400" />,
};

/**
 * Toast — inline accessible notification.
 * @param {'success'|'error'|'info'} type
 * @param {string} message
 * @param {()=>void} onClose
 * @param {number} autoDismissMs  - 0 = no auto-dismiss
 */
export default function Toast({ type = 'info', message, onClose, autoDismissMs = 3500 }) {
  useEffect(() => {
    if (!autoDismissMs) return;
    const t = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(t);
  }, [onClose, autoDismissMs]);

  const bg = {
    success: 'bg-emerald-500/15 border-emerald-500/40',
    error:   'bg-rose-500/15 border-rose-500/40',
    info:    'bg-blue-500/15 border-blue-500/40',
  }[type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-center gap-3 p-4 rounded-xl border ${bg} text-slate-200 text-sm font-semibold shadow-lg`}
    >
      {ICONS[type]}
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-white transition-colors ml-2"
      >
        <X size={16} />
      </button>
    </div>
  );
}
