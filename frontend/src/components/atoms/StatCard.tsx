import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  highlight?: boolean;
}

const StatCard: React.FC<CardProps> = ({ title, value, icon, highlight }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`p-5 rounded-2xl flex flex-col justify-between transition-all ${
        highlight 
          ? 'bg-gradient-to-br from-brand-900 to-slate-900 border border-brand-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-white' 
          : 'glass-panel text-slate-200'
      }`}
    >
      <div className={`text-xs uppercase font-black tracking-wider flex items-center gap-2 mb-3 ${
        highlight ? 'text-brand-400' : 'text-slate-400'
      }`}>
        {icon} {title}
      </div>
      <div className="text-3xl font-black truncate tracking-tighter">{value}</div>
    </motion.div>
  );
};

export default React.memo(StatCard);
