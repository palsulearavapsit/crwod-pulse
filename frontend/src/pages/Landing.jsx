import { Link } from 'react-router-dom';
import { Activity, Map, Users, Shield, Zap, Globe, MessageSquare, TrendingDown, BarChart2, Lock } from 'lucide-react';

const STATS = [
  { value: '45,000+', label: 'Attendees Managed' },
  { value: '< 100ms', label: 'Real-time Latency' },
  { value: '11',      label: 'Gemini AI Endpoints' },
  { value: '85+',     label: 'Automated Tests' },
];

const USPS = [
  { title: 'Real-Time Visibility',      desc: 'Live congestion tracking across all venue zones via Socket.io.', icon: <Activity aria-hidden="true" className="text-brand-500" /> },
  { title: 'AI Smart Routing',          desc: 'Gemini-powered gate & route recommendations eliminate chokepoints.', icon: <Map aria-hidden="true" className="text-brand-500" /> },
  { title: 'Admin Scenario Control',    desc: 'Instantly trigger Halftime, Gate Closure, and Egress scenarios.', icon: <Shield aria-hidden="true" className="text-brand-500" /> },
  { title: 'Accessibility-First',       desc: 'Step-free routing preference integrated natively into all flows.', icon: <Users aria-hidden="true" className="text-brand-500" /> },
  { title: 'Multilingual Alerts',       desc: 'EN → ES/FR/HI translation of live alerts via Gemini AI.', icon: <Globe aria-hidden="true" className="text-brand-500" /> },
  { title: 'Live Analytics Chart',      desc: 'Real-time bar chart of wait times with colour-coded congestion.', icon: <BarChart2 aria-hidden="true" className="text-brand-500" /> },
  { title: 'Secure Architecture',       desc: 'SHA-256 hashing, rate limiting, CSP headers, bearer token auth.', icon: <Lock aria-hidden="true" className="text-brand-500" /> },
  { title: 'Instant Broadcast Comms',   desc: 'Push venue-wide alerts with AI-enhanced message drafting.', icon: <MessageSquare aria-hidden="true" className="text-brand-500" /> },
  { title: 'Emergency Evacuation AI',   desc: 'Attendees get AI-generated step-by-step evacuation guidance.', icon: <Zap aria-hidden="true" className="text-brand-500" /> },
  { title: 'Time-Saved KPIs',           desc: 'Concrete impact metric — minutes saved per attendee, live.', icon: <TrendingDown aria-hidden="true" className="text-brand-500" /> },
];

const STEPS = [
  { num: '01', title: 'Scan Venue',         desc: 'Backend simulation engine models high-throughput IoT crowd metrics with mean-reverting drift per zone type.' },
  { num: '02', title: 'Process & Route',    desc: 'Gemini AI + deterministic logic recommend zero-congestion paths, updating every 4 seconds via Socket.io.' },
  { num: '03', title: 'Transform Experience', desc: 'Attendees bypass queues, admins trigger scenarios, and the venue boosts operational throughput in real time.' },
];

export default function Landing() {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-brand-500/30 selection:text-brand-200">

      {/* ── Skip to content ── */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-brand-500 text-slate-950 px-4 py-2 rounded-xl font-bold z-50">
        Skip to content
      </a>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-20 glass-panel border-b border-slate-800/50 px-6 sm:px-12 py-4 flex justify-between items-center" aria-label="Main navigation">
        <span className="font-black text-xl text-white tracking-tight flex items-center gap-2">
          <Activity size={20} className="text-brand-500" aria-hidden="true" /> CrowdPulse
        </span>
        <div className="flex gap-3">
          <Link to="/display" className="text-sm font-bold text-slate-400 hover:text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors">
            Display Mode
          </Link>
          <Link to="/login" className="text-sm font-black bg-brand-500 hover:bg-brand-400 text-slate-950 px-5 py-2 rounded-xl transition-all hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            Login →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="relative py-32 px-6 sm:px-12 overflow-hidden border-b border-brand-500/20" id="main-content">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 to-slate-950 -z-10" aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none z-0" aria-hidden="true" />

        <div className="max-w-5xl mx-auto relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-black tracking-widest uppercase px-4 py-2 rounded-full mb-8" aria-label="Powered by Gemini AI">
            <Zap size={14} aria-hidden="true" /> Powered by Gemini AI + Google Maps
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-white leading-none">
            CrowdPulse{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Live</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl leading-relaxed font-medium">
            Eliminate venue chokepoints, guide attendees with AI-powered real-time routing,
            and maintain total operational control — all from one dashboard.
          </p>

          <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
            <Link to="/login"
              aria-label="Login to the CrowdPulse platform"
              className="bg-brand-500 hover:bg-brand-400 text-slate-950 font-black tracking-wide py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105">
              Access Platform →
            </Link>
            <Link to="/display"
              aria-label="Open the public display board"
              className="border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 font-bold py-4 px-8 rounded-xl transition-all hover:scale-105">
              Public Display Board
            </Link>
          </div>
        </div>
      </header>

      {/* ── Live Stats Bar ── */}
      <section aria-label="Platform statistics" className="bg-brand-900/20 border-b border-brand-500/20 py-8 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-brand-400 mb-1" aria-label={`${s.value} ${s.label}`}>{s.value}</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-24 px-6 sm:px-12" aria-labelledby="how-heading">
        <div className="max-w-6xl mx-auto">
          <h2 id="how-heading" className="text-3xl font-black mb-16 text-center text-white tracking-tight">How CrowdPulse Works</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.num} className="glass-panel p-10 rounded-2xl relative overflow-hidden group hover:border-brand-500/50 transition-all hover:-translate-y-1">
                <div className="absolute -right-6 -top-6 text-[120px] font-black text-slate-800/20 group-hover:text-brand-500/10 transition-colors pointer-events-none select-none" aria-hidden="true">{s.num}</div>
                <span className="text-brand-400 font-black mb-2 block text-sm uppercase tracking-widest" aria-hidden="true">{s.num}</span>
                <h3 className="text-xl font-bold mb-4 text-white relative z-10">{s.title}</h3>
                <p className="text-slate-400 relative z-10 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section className="py-24 px-6 sm:px-12 bg-slate-900/50 border-t border-b border-slate-800" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <h2 id="features-heading" className="text-3xl font-black mb-4 text-center text-white tracking-tight">Capabilities & AI Layer</h2>
          <p className="text-center text-slate-400 mb-16 max-w-2xl mx-auto">Every feature is built on real WebSockets, real Gemini AI calls, and production-grade security practices.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
            {USPS.map((usp, i) => (
              <div key={i} className="p-6 rounded-2xl glass-panel hover:bg-slate-800 transition-all hover:-translate-y-1 group">
                <div className="mb-4 bg-brand-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-brand-400 group-hover:bg-brand-500/20 transition-colors">
                  {usp.icon}
                </div>
                <h3 className="font-bold mb-2 text-white text-sm">{usp.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{usp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Google Services Callout ── */}
      <section className="py-20 px-6 sm:px-12" aria-labelledby="google-heading">
        <div className="max-w-4xl mx-auto glass-panel p-10 rounded-3xl border border-brand-500/20 text-center shadow-[0_0_40px_rgba(16,185,129,0.08)]">
          <h2 id="google-heading" className="text-2xl font-black text-white mb-4">Built on Google's Ecosystem</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">CrowdPulse runs on Gemini 1.5 Flash for all AI features, Google Maps for venue location, Google Fonts for typography, and Google Analytics for usage intelligence.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Gemini 1.5 Flash AI', 'Google Maps Embed', 'Google Fonts (Inter)', 'Google Analytics'].map(s => (
              <span key={s} className="bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-black px-4 py-2 rounded-full tracking-wide">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 sm:px-12 text-center" aria-labelledby="cta-heading">
        <div className="max-w-2xl mx-auto">
          <h2 id="cta-heading" className="text-4xl font-black text-white mb-6 tracking-tight">Ready to experience it?</h2>
          <p className="text-slate-400 mb-10">Use the demo credentials or sign up for a new attendee account.</p>
          <Link to="/login" aria-label="Get started with CrowdPulse"
            className="inline-block bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-slate-950 font-black tracking-wide py-5 px-12 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105 text-lg">
            Get Started — It's Free →
          </Link>
        </div>
      </section>

    </div>
  );
}
