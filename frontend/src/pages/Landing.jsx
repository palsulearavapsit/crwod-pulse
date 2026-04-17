import { Link } from 'react-router-dom';
import { Activity, Map, Users, Shield, Zap, Globe, MessageSquare, TrendingDown } from 'lucide-react';

export default function Landing() {
  const usps = [
    { title: "Real-time Visibility", desc: "Live congestion tracking across all venue zones.", icon: <Activity className="text-brand-500" /> },
    { title: "Smart Guidance", desc: "AI-driven route & gate recommendations to save time.", icon: <Map className="text-brand-500" /> },
    { title: "Admin Scenario Control", desc: "Instantly trigger scenarios like Halftime or Gate Closures.", icon: <Shield className="text-brand-500" /> },
    { title: "Accessibility-First", desc: "Step-free routing preference integrated natively.", icon: <Users className="text-brand-500" /> },
    { title: "Instant Public Comms", desc: "Live centralized alert broadcasting to all platforms.", icon: <MessageSquare className="text-brand-500" /> },
    { title: "Time Saved Metric", desc: "Concrete value tracking with personalized 'time saved' KPIs.", icon: <TrendingDown className="text-brand-500" /> },
    { title: "Production-Ready Architecture", desc: "Realistic data simulation engineered for real-world IoT plug-in.", icon: <Zap className="text-brand-500" /> },
    { title: "Multilingual AI Base", desc: "Server-side NLP layer for instant translation and insights.", icon: <Globe className="text-brand-500" /> }
  ];

  const steps = [
    { num: "01", title: "Scan Venue", desc: "Backend ingest models simulate high-throughput IoT crowd metrics." },
    { num: "02", title: "Process & Routing", desc: "Deterministic logic + AI copilot recommend zero-congestion paths." },
    { num: "03", title: "Transform Experience", desc: "Fans avoid lines, venue boosts ops throughput seamlessly." }
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-brand-500/30 selection:text-brand-200">
      {/* Hero */}
      <header className="relative py-32 px-6 sm:px-12 overflow-hidden border-b border-brand-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 to-slate-950 -z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
        
        <div className="max-w-5xl mx-auto align-middle relative z-10 text-center sm:text-left">
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-white">CrowdPulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Live</span></h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl leading-relaxed font-medium">
            Upgrade the physical event experience. Eliminate chokepoints, guide your attendees seamlessly, and maintain total operational control with real-time intelligence.
          </p>
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
            <Link to="/login" className="bg-brand-500 hover:bg-brand-400 text-slate-950 font-black tracking-wide py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105">
              Login to Platform
            </Link>
            <Link to="/display" className="border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 font-bold py-4 px-8 rounded-xl transition-all hover:scale-105">
              Public Display Mode
            </Link>
          </div>
        </div>
      </header>

      {/* How it works */}
      <section className="py-24 px-6 sm:px-12 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black mb-16 text-center text-white tracking-tight">How CrowdPulse Works</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((s, idx) => (
              <div key={s.num} className="glass-panel p-10 rounded-2xl relative overflow-hidden group hover:border-brand-500/50 transition-colors">
                <div className="absolute -right-6 -top-6 text-[120px] font-black text-slate-800/20 group-hover:text-brand-500/10 transition-colors pointer-events-none select-none">{s.num}</div>
                <span className="text-brand-400 font-black mb-2 block">{s.num}</span>
                <h3 className="text-xl font-bold mb-4 text-white relative z-10">{s.title}</h3>
                <p className="text-slate-400 relative z-10 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="py-24 px-6 sm:px-12 bg-slate-900/50 border-t border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black mb-16 text-center text-white tracking-tight">Unique Capabilities & AI Layer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {usps.map((usp, i) => (
              <div key={i} className="p-6 rounded-2xl glass-panel hover:bg-slate-800 transition-all hover:-translate-y-1">
                <div className="mb-5 bg-brand-500/10 w-12 h-12 rounded-lg flex items-center justify-center text-brand-400">
                  {usp.icon}
                </div>
                <h4 className="font-bold mb-3 text-white">{usp.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{usp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}
