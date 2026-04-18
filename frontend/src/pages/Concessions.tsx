import React, { useState, useEffect } from 'react';
import { socketService } from '../services/socket';
import { Zone } from '../types';
import { ShoppingCart, Clock, CheckCircle2 } from 'lucide-react';

const Concessions: React.FC = () => {
  const [concessions, setConcessions] = useState<Zone[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    socketService.connect();
    socketService.onStateUpdate((s) => {
      setConcessions(s.zones.filter(z => z.type === 'concession'));
    });
    return () => socketService.disconnect();
  }, []);

  const addToCart = (item: any) => {
    setCart(prev => [...prev, item]);
  };

  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  if (ordered) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="glass-panel p-10 rounded-3xl text-center max-w-sm">
          <CheckCircle2 size={64} className="text-brand-400 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white mb-2">Order Confirmed!</h2>
          <p className="text-slate-400">Head to the Pick-up window. Your order will be ready in 4 minutes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black tracking-tight">Food & Drinks</h1>
        <p className="text-slate-400">Skip the line, order from your seat.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {concessions.map(z => (
          <div key={z.id} className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-brand-500/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">{z.name}</h3>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${z.congestion === 'red' ? 'bg-rose-500/10 text-rose-400' : 'bg-brand-500/10 text-brand-400'}`}>
                {z.waitTime}m Wait
              </div>
            </div>
            
            <button 
              onClick={() => addToCart({ id: z.id, name: z.name, price: 12.99 })}
              className="w-full bg-slate-900 border border-slate-700 hover:border-brand-500/50 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart size={14} /> Add Hot Dog Bundle ($12.99)
            </button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6">
          <button 
            onClick={() => setOrdered(true)}
            className="w-full bg-brand-600 hover:bg-brand-500 text-slate-950 font-black py-4 rounded-2xl shadow-2xl flex items-center justify-between px-8"
          >
            <span>Checkout ({cart.length} items)</span>
            <span>${total.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Concessions;
