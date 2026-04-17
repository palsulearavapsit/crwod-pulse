import { Link } from 'react-router-dom';
import { ArrowLeft, Crown, ShieldCheck, Zap } from 'lucide-react';

export default function Upgrade() {
  const plans = [
    {
      name: "VIP Premium",
      price: "$49",
      period: "per event",
      icon: <ShieldCheck size={32} className="text-blue-400" />,
      color: "blue",
      features: ["Premium routing (less crowds)", "Fast-track gate access", "VIP restroom access", "5% off concessions"]
    },
    {
      name: "Platinum Elite",
      price: "$149",
      period: "per event",
      icon: <Crown size={32} className="text-amber-400" />,
      color: "amber",
      popular: true,
      features: ["All VIP Perks", "Exclusive Platinum Lounge Access", "Dedicated Waitstaff", "Post-game private egress"]
    }
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200">
      <header className="glass-panel text-white p-4 sticky top-0 z-10 flex items-center gap-3 shadow-lg">
        <Link to="/attendee" className="text-brand-400 hover:text-brand-300"><ArrowLeft /></Link>
        <h1 className="font-extrabold text-xl tracking-tight">Upgrade Pass</h1>
      </header>

      <main className="p-6 max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-4">Skip the Lines.</h2>
          <p className="text-xl text-slate-400">Upgrade your experience with our priority routing passes.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan, i) => (
            <div key={i} className={`glass-panel p-8 rounded-3xl border-2 relative transition-transform hover:scale-[1.02] ${plan.popular ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'border-slate-800'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-400 text-amber-950 font-black text-xs uppercase tracking-widest px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="mb-4">{plan.icon}</div>
                  <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-white">{plan.price}</div>
                  <div className="text-sm text-slate-400">{plan.period}</div>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3 text-slate-300 font-medium">
                    <Zap size={16} className={`text-${plan.color}-400`} />
                    {feat}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => {
                  localStorage.setItem('vipStatus', 'active');
                  alert(`Purchased ${plan.name} successfully! You now have Premium Routing enabled.`);
                  window.location.href = '/attendee';
                }}
                className={`w-full font-black py-4 rounded-xl transition-all shadow-lg text-slate-950 ${plan.popular ? 'bg-gradient-to-r from-amber-500 to-amber-300 hover:from-amber-400 hover:to-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-200 hover:bg-white'}`}
              >
                Purchase {plan.name}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
