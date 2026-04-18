import React, { useState } from 'react';
import { Star, ShieldCheck, Zap, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Upgrade: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUpgrade = (plan: string) => {
    setSelected(plan);
    setTimeout(() => navigate('/attendee'), 2000);
  };

  if (selected) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="glass-panel p-10 rounded-3xl text-center">
          <CheckCircle2 size={64} className="text-brand-400 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white">Upgraded to {selected}!</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <h1 className="text-4xl font-black mb-10 text-center mt-10">Choose Your Status</h1>
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-[40px] border border-white/5">
          <ShieldCheck className="text-brand-400 mb-6" size={48} />
          <h2 className="text-2xl font-black mb-2">Priority Pro</h2>
          <p className="text-slate-400 mb-6 text-sm">Real-time alerts & express concession ordering.</p>
          <button onClick={() => handleUpgrade('Pro')} className="w-full bg-slate-800 py-4 rounded-2xl font-bold">Start Free</button>
        </div>
        <div className="glass-panel p-8 rounded-[40px] border-2 border-brand-500/50 bg-brand-500/10">
          <Zap className="text-brand-400 mb-6" size={48} />
          <h2 className="text-3xl font-black mb-2 italic">VIP Ultimate</h2>
          <p className="text-slate-200 mb-6 text-sm font-bold">Secret fast-tracks & personal AI concierge.</p>
          <button onClick={() => handleUpgrade('VIP')} className="w-full bg-brand-600 text-slate-950 py-4 rounded-2xl font-black">Go VIP ($29)</button>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
