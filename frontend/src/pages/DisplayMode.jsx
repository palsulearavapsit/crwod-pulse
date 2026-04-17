import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export default function DisplayMode() {
  const [state, setState] = useState({ zones: [], alerts: [] });
  const [advisory, setAdvisory] = useState('');

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('state:update', (newState) => setState(newState));
    socket.on('alert:new', (alert) => {
      setState(prev => ({ ...prev, alerts: [alert, ...prev.alerts].slice(0,1) }));
    });
    
    // Generate an AI advisory every 15s
    const fetchAdvisory = async () => {
      try {
        const res = await fetch(`${API_URL}/api/ai/predictive-qa`, { method: 'POST' });
        const data = await res.json();
        setAdvisory(data.forecast);
      } catch(e) {}
    }
    fetchAdvisory();
    const inv = setInterval(fetchAdvisory, 15000);

    return () => { socket.disconnect(); clearInterval(inv); }
  }, []);

  return (
    <div className="bg-black min-h-screen text-white font-sans overflow-hidden flex flex-col">
      <header className="p-8 pb-4 flex justify-between items-end border-b border-white/20">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter">Stadium Status</h1>
          <p className="text-2xl text-slate-400 mt-2">Live Directory</p>
        </div>
        <div className="text-right">
          <div className="text-6xl font-black text-brand-500">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
      </header>

      {state.alerts.length > 0 && (
        <div className="bg-red-600 text-white text-4xl p-6 font-bold truncate text-center animate-pulse">
           ⚠️ {state.alerts[0].message}
        </div>
      )}
      {advisory && state.alerts.length === 0 && (
        <div className="bg-brand-900 text-brand-100 text-3xl p-6 font-semibold text-center border-b border-brand-800">
           💡 AI Advisory: {advisory}
        </div>
      )}

      <main className="p-8 flex-1 grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-4xl font-bold mb-6 border-b border-white/20 pb-4 text-slate-300">Entrances</h2>
          <div className="space-y-4">
            {state.zones.filter(z=>z.type==='gate').map(z=>(
              <div key={z.id} className="flex justify-between items-center text-4xl bg-white/5 p-6 rounded-2xl">
                <span className="font-bold">{z.name}</span>
                <span className={`px-4 py-2 rounded-xl font-black
                    ${z.congestion==='red'?'bg-red-600 text-white':z.congestion==='yellow'?'bg-yellow-500 text-black':'bg-green-500 text-white'}
                `}>{z.waitTime}m wait</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-4xl font-bold mb-6 border-b border-white/20 pb-4 text-slate-300">Concessions</h2>
          <div className="space-y-4">
            {state.zones.filter(z=>z.type==='concession' || z.type==='restroom').map(z=>(
              <div key={z.id} className="flex justify-between items-center text-4xl bg-white/5 p-6 rounded-2xl">
                <span className="font-bold">{z.name}</span>
                <span className={`px-4 py-2 rounded-xl font-black
                    ${z.congestion==='red'?'bg-red-600 text-white':z.congestion==='yellow'?'bg-yellow-500 text-black':'bg-green-500 text-white'}
                `}>{z.waitTime}m wait</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
