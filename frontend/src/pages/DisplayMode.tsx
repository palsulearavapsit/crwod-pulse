import React, { useState, useEffect } from 'react';
import { socketService } from '../services/socket';
import { VenueState, Zone, Alert } from '../types';

const DisplayMode: React.FC = () => {
  const [state, setState] = useState<VenueState>({ zones: [], alerts: [], kpis: {} });

  useEffect(() => {
    socketService.connect();
    socketService.onStateUpdate((s) => setState(s));
    return () => socketService.disconnect();
  }, []);

  const gates = state.zones.filter(z => z.type === 'gate');
  const food = state.zones.filter(z => z.type === 'concession');

  return (
    <div className="bg-black min-h-screen text-white p-10 flex flex-col font-sans">
      <header className="flex justify-between items-end border-b border-white/20 pb-10 mb-10">
        <div>
          <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none">CrowdPulse</h1>
          <p className="text-brand-400 text-2xl font-black uppercase tracking-[0.5em] mt-4">Live Hub Monitor</p>
        </div>
        <div className="text-right">
          <div className="text-6xl font-black tabular-nums">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="text-slate-400 font-bold uppercase tracking-widest mt-2">{state.kpis.totalFans || 42500} Fans Active</div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-10 flex-1">
        {/* Gates Table */}
        <div className="glass-panel-light p-8 rounded-[40px] border-4 border-white/5">
          <h2 className="text-4xl font-black mb-8 flex justify-between items-center">
            <span>Stadium Gates</span>
            <span className="text-slate-500 text-xl font-bold">Estimated Entry</span>
          </h2>
          <div className="space-y-4">
            {gates.map(z => (
              <div key={z.id} className="flex justify-between items-center text-4xl font-black border-b border-white/5 pb-4">
                <div className="flex items-center gap-6">
                  <div className={`w-6 h-6 rounded-full ${z.congestion === 'red' ? 'bg-rose-500 shadow-[0_0_20px_#f43f5e]' : 'bg-brand-500 shadow-[0_0_20px_#10b981]'}`} />
                  <span className="text-slate-400">{z.name}</span>
                </div>
                <div className={z.congestion === 'red' ? 'text-rose-500' : 'text-white'}>
                  {z.isClosed ? '---' : `${z.waitTime} MIN`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Food */}
        <div className="flex flex-col gap-10">
          <div className="glass-panel-light p-8 rounded-[40px] bg-brand-500/10 border-4 border-brand-500/20">
             <h2 className="text-4xl font-black mb-6 text-brand-400">Live Crowd Alerts</h2>
             <div className="text-3xl font-bold leading-tight uppercase italic underline decoration-brand-500/50 underline-offset-8">
                {state.alerts?.[0]?.message || "All entry gates operating at optimal capacity. Welcome to the venue."}
             </div>
          </div>
          
          <div className="glass-panel-light p-8 rounded-[40px] border-4 border-white/5 flex-1">
            <h2 className="text-4xl font-black mb-8">Fastest Food</h2>
            <div className="space-y-4">
               {food.slice(0, 3).map(z => (
                 <div key={z.id} className="flex justify-between items-center text-3xl font-black">
                    <span className="text-slate-500 underline decoration-slate-700">{z.name}</span>
                    <span className="text-brand-400 italic">WAIT: {z.waitTime}m</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayMode;
