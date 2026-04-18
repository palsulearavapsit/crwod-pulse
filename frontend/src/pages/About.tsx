import { Link } from 'react-router-dom';
import { ArrowLeft, Server, Wifi, Cpu, Database, Globe, Lock, TestTube2 } from 'lucide-react';

const TECH_STACK = [
  { label: 'Frontend',   value: 'Vite + React 19',                 icon: <Cpu size={18} aria-hidden="true" className="text-brand-400" /> },
  { label: 'Backend',    value: 'Node.js + Express 5',             icon: <Server size={18} aria-hidden="true" className="text-brand-400" /> },
  { label: 'Real-Time',  value: 'Socket.io (WebSocket)',           icon: <Wifi size={18} aria-hidden="true" className="text-brand-400" /> },
  { label: 'AI Engine',  value: 'Gemini 1.5 Flash (11 endpoints)', icon: <Globe size={18} aria-hidden="true" className="text-brand-400" /> },
  { label: 'State',      value: 'In-memory (IoT-ready)',           icon: <Database size={18} aria-hidden="true" className="text-brand-400" /> },
  { label: 'Security',   value: 'SHA-256 · Rate Limiting · CSP',  icon: <Lock size={18} aria-hidden="true" className="text-brand-400" /> },
  { label: 'Testing',    value: 'Vitest + Jest + Supertest',       icon: <TestTube2 size={18} aria-hidden="true" className="text-brand-400" /> },
];

const REAL_VS_SIM = [
  { label: 'AI Backend (Gemini API)',  status: 'REAL',      color: 'emerald', desc: 'All 11 AI endpoints call Gemini 1.5 Flash with graceful mock fallback.' },
  { label: 'Live Updates (Socket.io)', status: 'REAL',      color: 'emerald', desc: 'Genuine WebSocket delta pushes to all connected clients every 3s.' },
  { label: 'Crowd Sensor Data',        status: 'SIMULATED', color: 'amber',   desc: 'Mean-reverting simulation engine models real IoT crowd density drift.' },
  { label: 'Route Pathfinding',        status: 'DETERMINISTIC', color: 'sky', desc: 'Pure algorithmic routing logic, completely independent of the LLM.' },
  { label: 'Payment (QR Code)',        status: 'DEMO',      color: 'violet',  desc: 'QR codes are generated live but payment gateway is not wired.' },
];

export default function About() {
  return (
    <div className="bg-slate-950 min-h-screen py-10 px-6 text-slate-200">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <Link to="/" aria-label="Back to home" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors mb-8 font-bold">
          <ArrowLeft size={18} aria-hidden="true" /> Back to Home
        </Link>

        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">System Architecture & AI Docs</h1>
        <p className="text-slate-400 mb-12 text-lg leading-relaxed">Technical deep-dive into how CrowdPulse is built — what's real, what's simulated, and how it scales.</p>

        {/* Architecture diagram */}
        <section className="glass-panel p-8 rounded-2xl mb-8" aria-labelledby="arch-heading">
          <h2 id="arch-heading" className="text-xl font-bold mb-5 text-white flex items-center gap-2">
            <Server size={20} className="text-brand-400" aria-hidden="true" /> Architecture Overview
          </h2>
          <pre className="bg-slate-900 text-emerald-400 p-6 rounded-xl text-sm overflow-x-auto font-mono leading-relaxed" aria-label="ASCII architecture diagram" tabIndex={0}>
{`[Sensors / IoT  (Simulated mean-reversion engine)]
        │  4s tick
        ▼
[Node.js Backend  ·  Express 5  ·  Socket.io]
    │            │            │
    ├─ /api/*    ├─ /api/ai/* └──── WS broadcast
    │  REST+Auth │  Gemini 1.5      (3s interval,
    │            │   Flash          clients only)
    ▼            ▼
[Google AI Studio]    [React 19 Client]
                           │
                     SocketContext ──► All pages
                     (shared socket)`}
          </pre>
        </section>

        {/* Tech stack */}
        <section className="glass-panel p-8 rounded-2xl mb-8" aria-labelledby="stack-heading">
          <h2 id="stack-heading" className="text-xl font-bold mb-5 text-white">Tech Stack</h2>
          <dl className="grid sm:grid-cols-2 gap-4">
            {TECH_STACK.map(t => (
              <div key={t.label} className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                {t.icon}
                <div>
                  <dt className="text-xs font-black uppercase tracking-widest text-slate-500">{t.label}</dt>
                  <dd className="font-bold text-slate-200 mt-0.5">{t.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        {/* Real vs Simulated */}
        <section className="glass-panel p-8 rounded-2xl mb-8" aria-labelledby="real-sim-heading">
          <h2 id="real-sim-heading" className="text-xl font-bold mb-5 text-white">What is Real vs Simulated?</h2>
          <ul className="space-y-4">
            {REAL_VS_SIM.map(r => (
              <li key={r.label} className="flex gap-4 items-start">
                <span className={`text-xs font-black px-2 py-1 rounded-lg flex-shrink-0 mt-0.5 bg-${r.color}-500/20 text-${r.color}-300 border border-${r.color}-500/30`}>
                  {r.status}
                </span>
                <div>
                  <p className="font-bold text-white">{r.label}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{r.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Future Path */}
        <section className="glass-panel p-8 rounded-2xl" aria-labelledby="future-heading">
          <h2 id="future-heading" className="text-xl font-bold mb-4 text-white">Production Upgrade Path</h2>
          <p className="text-slate-400 mb-4 leading-relaxed">
            The <code className="text-brand-400 bg-slate-900 px-2 py-0.5 rounded-lg text-sm">mockState.js</code> simulation
            is seamlessly replaceable by real IoT streams with zero frontend changes:
          </p>
          <ul className="space-y-2" aria-label="Production upgrade options">
            {[
              'Optical turnstile counts → zone wait time feed',
              'CCTV CV zone-density estimation (OpenCV / YOLO)',
              'WiFi access point triangulation for real-time location',
              'Firebase RTDB for persistent state + offline fallback',
              'Google Cloud PubSub for high-throughput sensor ingestion',
            ].map(s => (
              <li key={s} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-brand-500 flex-shrink-0 mt-0.5" aria-hidden="true">→</span> {s}
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  );
}
