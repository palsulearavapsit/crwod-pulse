import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(next);
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-brand-500/50 text-slate-300 transition-all text-xs font-bold"
    >
      <Globe size={14} />
      {i18n.language.toUpperCase()}
    </button>
  );
};

export default LanguageSwitcher;
