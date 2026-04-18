import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const icons: Record<string, React.JSX.Element> = {
    success: <CheckCircle className="text-brand-400" size={20} />,
    error: <AlertCircle className="text-rose-400" size={20} />,
    info: <Info className="text-brand-400" size={20} />,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="fixed bottom-10 left-10 right-10 md:left-auto md:right-10 z-[100]"
      >
        <div className={`glass-panel p-4 rounded-2xl flex items-center gap-4 shadow-2xl border ${
          type === 'error' ? 'border-rose-500/30' : 'border-brand-500/30'
        }`}>
          {icons[type]}
          <p className="flex-1 text-sm font-bold text-slate-200">{message}</p>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
