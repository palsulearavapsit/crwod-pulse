import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const API_URL    = import.meta.env.VITE_API_URL    || 'http://localhost:3000';

const CONGESTION_STYLES = {
  red:    'bg-red-600 text-white',
  yellow: 'bg-yellow-500 text-black',
  green:  'bg-emerald-500 text-white',
};

export default function DisplayMode() {
  const [state, setState]     = useState({ zones: [], alerts: [] });
  const [advisory, setAdvisory] = useState('');
  const [clock, setClock]     = useState(new Date());

  // Real-time clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, { reconnectionAttempts: 5 });
    socket.on('state:update', s  => setState(s));
    socket.on('alert:new',    a  => setState(prev => ({ ...prev, alerts: [a, ...prev.alerts].slice(0, 1) })));

    // Fetch advisory every 30s
    const fetchAdvisory = async () => {
      try {
        const res  = await fetch(`${API_URL}/api/ai/ops-summary`, { method: 'POST' });
        const data = await res.json();
        setAdvisory(data.summary);
      } catch {}
    };
    fetchAdvisory();
    const inv = setInterval(fetchAdvisory, 30_000);

    return () => { socket.disconnect(); clearInterval(inv); };
  }, []);

  const gates       = state.zones.filter(z => z.type === 'gate');
  const serviceZones = state.zones.filter(z => z.type === 'concession' || z.type === 'restroom');

  return (
    <div className="bg-black min-h-screen text-white font-sans overflow-hidden flex flex-col">

      {/* ── Header ── */}
      <header className="p-8 pb-4 flex justify-between items-end border-b border-white/20" role="banner">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter">Stadium Status</h1>
          <p className="text-2xl text-slate-400 mt-2">Live Directory — CrowdPulse AI</p>
        </div>
        <div className="text-right">
          <time
            dateTime={clock.toISOString()}
            aria-label={`Current time: ${clock.toLocaleTimeString()}`}
            className="text-6xl font-black text-brand-500"
          >
            {clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
          <p className="text-slate-500 text-lg mt-1">{clock.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
      </header>

      {/* ── Alert / Advisory Ticker ── */}
      {state.alerts.length > 0 ? (
        <div role="alert" aria-live="assertive"
          className="bg-red-600 text-white text-4xl p-6 font-bold text-center animate-pulse">
          ⚠️ {state.alerts[0].message}
        </div>
      ) : advisory ? (
        <div role="status" aria-live="polite"
          className="bg-brand-900 text-brand-100 text-2xl p-5 font-semibold text-center border-b border-brand-800">
          💡 AI Advisory: {advisory}
        </div>
      ) : null}

      {/* ── Main Grid ── */}
      <main className="p-8 flex-1 grid grid-cols-2 gap-8">

        {/* Gates */}
        <section aria-labelledby="gates-heading">
          <h2 id="gates-heading" className="text-4xl font-bold mb-6 border-b border-white/20 pb-4 text-slate-300">
            🚪 Entrances
          </h2>
          <div className="space-y-4" role="list" aria-label="Gate wait times">
            {gates.map(z => (
              <div key={z.id} role="listitem"
                aria-label={`${z.name}: ${z.isClosed ? 'Closed' : `${z.waitTime} minute wait, ${z.congestion} congestion`}`}
                className="flex justify-between items-center text-4xl bg-white/5 p-6 rounded-2xl">
                <span className="font-bold">{z.name}</span>
                <span className={`px-4 py-2 rounded-xl font-black text-3xl ${z.isClosed ? 'bg-slate-700 text-slate-400' : CONGESTION_STYLES[z.congestion] || 'bg-slate-600'}`}>
                  {z.isClosed ? '🔒 CLOSED' : `${z.waitTime}m wait`}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Concessions & Restrooms */}
        <section aria-labelledby="services-heading">
          <h2 id="services-heading" className="text-4xl font-bold mb-6 border-b border-white/20 pb-4 text-slate-300">
            🍔 Concessions & Restrooms
          </h2>
          <div className="space-y-4" role="list" aria-label="Service zone wait times">
            {serviceZones.map(z => (
              <div key={z.id} role="listitem"
                aria-label={`${z.name}: ${z.waitTime} minute wait, ${z.congestion} congestion`}
                className="flex justify-between items-center text-4xl bg-white/5 p-6 rounded-2xl">
                <span className="font-bold">{z.name}</span>
                <span className={`px-4 py-2 rounded-xl font-black text-3xl ${CONGESTION_STYLES[z.congestion] || 'bg-slate-600 text-white'}`}>
                  {z.waitTime}m wait
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="p-6 border-t border-white/10 flex justify-between text-slate-600 text-sm font-bold uppercase tracking-widest">
        <span>CrowdPulse — Real-Time Venue Intelligence</span>
        <span>Powered by Gemini AI + Google Maps</span>
      </footer>
    </div>
  );
}
