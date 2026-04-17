import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { MapPin, Navigation, Clock, MessageSquare, Mic, Compass, Crown, CreditCard, ArrowUpCircle, LogOut, Globe, BarChart2, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CONGESTION_LABEL, CONGESTION_COLOR, CONGESTION_BG, SUPPORTED_LANGS, ROLES } from '../utils/constants';
import { apiFetch } from '../utils/fetchUtils';

const API_URL    = import.meta.env.VITE_API_URL    || 'http://localhost:3000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Google Maps Embed — works without API key via public embed format
const VENUE_MAP_URL = `https://maps.google.com/maps?q=narendra+modi+stadium+ahmedabad&z=15&output=embed&hl=en`;

// Track events to Google Analytics
function trackEvent(action, category, label) {
  if (typeof gtag !== 'undefined') {
    gtag('event', action, { event_category: category, event_label: label });
  }
}

// ── Bar colours ────────────────────────────────────────────────────────────────
const BAR_COLOR = { green: '#10b981', yellow: '#f59e0b', red: '#f43f5e' };

export default function AttendeeDashboard() {
  const [state, setState]               = useState({ zones: [], alerts: [], kpis: {} });
  const [recommendations, setRecs]      = useState(null);
  const [accessibleMode, setAccessible] = useState(false);
  const [chatOpen, setChatOpen]         = useState(false);
  const [chatMsg, setChatMsg]           = useState('');
  const [chatHistory, setChatHistory]   = useState([{ role: 'bot', text: 'Hi! I am your CrowdPulse AI. How can I help?' }]);
  const [arCompass, setArCompass]       = useState(false);
  const [alertLang, setAlertLang]       = useState('');
  const [translatedAlert, setTranslated]= useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [toast, setToast]               = useState(null);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyGuide, setEmergencyGuide] = useState('');
  const [emergencyZone, setEmergencyZone] = useState('');
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [activeTab, setActiveTab]       = useState('zones'); // 'zones' | 'chart'

  const chatEndRef   = useRef(null);
  const chatInputRef = useRef(null);
  const chatBtnRef   = useRef(null);
  const navigate     = useNavigate();
  const isVip        = localStorage.getItem('vipStatus') === 'active';

  // ── Session expiry check ──────────────────────────────────────────────────
  useEffect(() => {
    const expiry = localStorage.getItem('cp_sessionExpiry');
    if (expiry && Date.now() > Number(expiry)) {
      ['userRole', 'cp_loggedInUser', 'cp_sessionExpiry'].forEach(k => localStorage.removeItem(k));
      navigate('/login');
    }
    // Track page view
    trackEvent('page_view', 'Attendee', 'Dashboard');
  }, [navigate]);

  // ── Socket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, { reconnectionAttempts: 5 });
    socket.on('state:update', s => setState(s));
    socket.on('alert:new', a =>
      setState(prev => ({ ...prev, alerts: [a, ...prev.alerts].slice(0, 5) }))
    );
    fetchRecs();
    return () => socket.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-scroll chat ──────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // ── Focus management ──────────────────────────────────────────────────────
  useEffect(() => {
    if (chatOpen) setTimeout(() => chatInputRef.current?.focus(), 50);
    else chatBtnRef.current?.focus();
  }, [chatOpen]);

  // ── Focus trap inside chat panel ──────────────────────────────────────────
  const handleChatKeyDown = (e) => {
    if (e.key === 'Escape') { setChatOpen(false); return; }
    if (e.key !== 'Tab') return;
    const panel = e.currentTarget;
    const focusable = panel.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  const fetchRecs = useCallback(async () => {
    try {
      const data = await apiFetch(`${API_URL}/api/recommendations?vip=${isVip}`);
      setRecs(data);
    } catch {}
  }, [isVip]);

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    const userMsg = chatMsg.trim();
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMsg('');
    trackEvent('chat_message', 'Attendee', 'AI Chat');
    try {
      const data = await apiFetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      setChatHistory(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'bot', text: "Sorry, I'm offline right now." }]);
    }
  };

  const translateAlert = async (langCode) => {
    if (!state.alerts.length || !langCode) return;
    setIsTranslating(true);
    setAlertLang(langCode);
    trackEvent('translate_alert', 'Attendee', langCode);
    try {
      const data = await apiFetch(`${API_URL}/api/ai/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: state.alerts[0].message, targetLang: langCode }),
      });
      setTranslated(data.translation);
    } catch { setTranslated('Translation unavailable.'); }
    setIsTranslating(false);
  };

  const requestEmergencyGuide = async () => {
    if (!emergencyZone.trim()) return;
    setEmergencyLoading(true);
    trackEvent('emergency_guide_request', 'Attendee', emergencyZone);
    try {
      const data = await apiFetch(`${API_URL}/api/ai/emergency-guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone: emergencyZone }),
      });
      setEmergencyGuide(data.instructions);
    } catch { setEmergencyGuide('Please head to the nearest exit and follow staff instructions.'); }
    setEmergencyLoading(false);
  };

  // ── Memoised zone data ────────────────────────────────────────────────────
  const chartData = useMemo(() =>
    state.zones
      .filter(z => z.type !== 'seating')
      .map(z => ({
        name: z.name.split(' ').slice(0, 2).join(' '),
        wait: z.waitTime,
        congestion: z.congestion,
      })),
    [state.zones]
  );

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  return (
    <div className="bg-slate-950 min-h-screen pb-24 relative text-slate-200">

      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-brand-500 text-slate-950 px-4 py-2 rounded-xl font-bold z-50">
        Skip to content
      </a>

      {/* ── Header ── */}
      <header className="glass-panel text-white p-4 sticky top-0 z-20 flex justify-between items-center shadow-lg">
        <h1 className="font-bold text-xl flex items-center gap-2">
          <ActivityIcon aria-hidden="true" /> CrowdPulse
        </h1>
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <label htmlFor="accessible-toggle" className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
            <input id="accessible-toggle" type="checkbox" checked={accessibleMode} onChange={e => setAccessible(e.target.checked)} className="rounded" aria-label="Enable accessible routing" />
            Accessible
          </label>
          {/* Emergency button */}
          <button
            onClick={() => { setEmergencyOpen(true); trackEvent('emergency_open', 'Attendee', 'header'); }}
            aria-label="Open emergency evacuation assistant"
            className="flex items-center gap-1.5 text-xs font-black text-rose-400 border border-rose-500/40 px-3 py-1.5 rounded-xl hover:bg-rose-500/10 transition-colors"
          >
            <Shield size={14} aria-hidden="true" /> Emergency
          </button>
          <button onClick={() => { localStorage.removeItem('userRole'); localStorage.removeItem('vipStatus'); navigate('/login'); }}
            aria-label="Sign out" className="flex items-center gap-2 font-bold text-slate-400 hover:text-rose-400 transition-colors">
            <LogOut size={18} aria-hidden="true" /> Sign Out
          </button>
        </div>
      </header>

      {/* ── VIP Banner ── */}
      {isVip && (
        <div role="status" className="bg-gradient-to-r from-amber-600 to-amber-900 border-b border-amber-500/50 p-2 text-xs flex justify-center items-center gap-2 font-black tracking-widest uppercase text-amber-100">
          <Crown size={16} className="text-amber-300" aria-hidden="true" /> Premium Routing Active
        </div>
      )}

      {/* ── Live Alert Banner with Multilingual ── */}
      {state.alerts.length > 0 && (
        <div role="alert" aria-live="assertive" className="bg-red-600 text-white p-3 px-4 shadow-sm">
          <div className="flex justify-between items-start gap-4 max-w-5xl mx-auto flex-wrap">
            <div className="text-sm font-semibold">
              <span aria-hidden="true">⚠️ </span>
              {translatedAlert && alertLang
                ? <>{translatedAlert} <span className="text-red-200 text-xs">[{alertLang.toUpperCase()}]</span></>
                : state.alerts[0].message}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Globe size={14} aria-hidden="true" />
              <select aria-label="Translate alert to language" value={alertLang} onChange={e => translateAlert(e.target.value)}
                disabled={isTranslating} className="text-xs bg-red-800 border border-red-700 rounded px-2 py-1 text-white cursor-pointer">
                <option value="">EN (Original)</option>
                {SUPPORTED_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              {isTranslating && <span className="text-xs text-red-200 animate-pulse">translating…</span>}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div role="alert" aria-live="polite" className="max-w-5xl mx-auto px-4 pt-3 z-10 relative">
          <div className="bg-brand-500/15 border border-brand-500/40 text-slate-200 text-sm font-semibold p-3 rounded-xl flex items-center justify-between gap-3">
            <span>{toast}</span>
            <button onClick={() => setToast(null)} aria-label="Dismiss notification" className="text-slate-400 hover:text-white">✕</button>
          </div>
        </div>
      )}

      <main id="main-content" className="p-4 max-w-5xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* ── Left Column ── */}
        <div className="md:col-span-5 space-y-6">

          {/* AI Route Banner */}
          <section aria-labelledby="route-heading" className="glass-panel border-brand-500/30 rounded-2xl p-6 flex flex-col gap-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
            <div className="flex gap-4 items-start z-10">
              <div className="bg-brand-500/20 p-3 rounded-xl text-brand-400" aria-hidden="true"><MapPin size={24} /></div>
              <div>
                <h2 id="route-heading" className="font-extrabold text-white text-lg mb-1">AI Smart Route</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {recommendations?.lowCrowdRoute || 'Calculating optimal route…'}
                  {accessibleMode && ' (Priority elevators selected).'}
                </p>
              </div>
            </div>
            <button onClick={() => { setArCompass(!arCompass); trackEvent('ar_wayfinding', 'Attendee', arCompass ? 'stop' : 'start'); }}
              aria-pressed={arCompass} aria-label={arCompass ? 'Stop AR wayfinding' : 'Start AR wayfinding'}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white p-4 rounded-xl text-sm font-black tracking-widest flex justify-center items-center gap-2 z-10 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Compass size={20} className={arCompass ? 'animate-spin' : ''} aria-hidden="true" />
              {arCompass ? 'AR COMPASS ACTIVE' : 'START AR WAYFINDING'}
            </button>
            {arCompass && <div className="absolute inset-0 bg-brand-500/10 pointer-events-none z-0 animate-pulse" aria-hidden="true" />}
          </section>

          {/* KPI Widgets */}
          <section aria-label="Key metrics" className="grid grid-cols-2 gap-4">
            <Widget title="Best Gate"     val={recommendations?.bestGate?.name || '—'}          icon={<Navigation size={18} />} highlight />
            <Widget title="Fastest Snack" val={recommendations?.fastestConcession?.name || '—'} icon={<MapPin size={18} />} />
            <Widget title="Avg Wait"      val={`${state.kpis?.averageWait || 0} min`}           icon={<Clock size={18} />} />
            <Widget title="Time Saved"    val={`${state.kpis?.timeSavedTotal || 0} min`}        icon={<ActivityIcon size={18} />} highlight />
          </section>

          {/* Quick Actions */}
          <nav aria-label="Quick actions" className="grid grid-cols-2 gap-4">
            <Link to="/concessions" aria-label="Mobile express order" onClick={() => trackEvent('navigate', 'Attendee', 'concessions')}
              className="glass-panel text-white hover:bg-slate-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm group">
              <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400 group-hover:scale-110 transition-transform" aria-hidden="true"><CreditCard size={24} /></div>
              <span className="font-bold text-sm text-center">Mobile Express Order</span>
            </Link>
            <Link to="/upgrade" aria-label="Upgrade your pass" onClick={() => trackEvent('navigate', 'Attendee', 'upgrade')}
              className="glass-panel text-white hover:bg-slate-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm group">
              <div className="bg-amber-500/20 p-3 rounded-full text-amber-400 group-hover:scale-110 transition-transform" aria-hidden="true"><ArrowUpCircle size={24} /></div>
              <span className="font-bold text-sm text-center">Upgrade Pass</span>
            </Link>
          </nav>
        </div>

        {/* ── Right Column ── */}
        <div className="md:col-span-7 space-y-6">

          {/* Tabs: Zones | Chart */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-2xl text-white tracking-tight flex items-center gap-2">
                <ActivityIcon className="text-brand-500" aria-hidden="true" /> Live Venue Status
              </h2>
              <div className="flex gap-1 bg-slate-900 rounded-xl p-1" role="tablist" aria-label="View mode">
                <button role="tab" aria-selected={activeTab === 'zones'} onClick={() => setActiveTab('zones')}
                  className={`px-4 py-2 rounded-lg text-xs font-black tracking-wide transition-colors ${activeTab === 'zones' ? 'bg-brand-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
                  Zones
                </button>
                <button role="tab" aria-selected={activeTab === 'chart'} onClick={() => { setActiveTab('chart'); trackEvent('view_chart', 'Attendee', 'wait_times'); }}
                  className={`px-4 py-2 rounded-lg text-xs font-black tracking-wide transition-colors flex items-center gap-1 ${activeTab === 'chart' ? 'bg-brand-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
                  <BarChart2 size={14} aria-hidden="true" /> Chart
                </button>
              </div>
            </div>

            {/* Zone Cards */}
            {activeTab === 'zones' && (
              <div className="grid sm:grid-cols-2 gap-4" role="list" aria-label="Venue zones and wait times" aria-live="polite">
                {state.zones.map(z => (
                  <div key={z.id} role="listitem"
                    className={`p-4 rounded-2xl border glass-panel flex justify-between items-center transition-all hover:scale-[1.02] ${CONGESTION_BG[z.congestion] || 'border-slate-700'}`}
                    aria-label={`${z.name}: ${CONGESTION_LABEL[z.congestion] || ''} congestion, ${z.waitTime} minute wait${z.isClosed ? ', closed' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${z.congestion === 'red' ? 'bg-rose-500' : z.congestion === 'yellow' ? 'bg-amber-400' : 'bg-emerald-400'}`} aria-hidden="true" />
                      <div>
                        <span className="font-bold text-slate-200 block">{z.name}</span>
                        <span className={`text-xs font-semibold ${CONGESTION_COLOR[z.congestion]}`}>{z.isClosed ? 'Closed' : `${CONGESTION_LABEL[z.congestion] || '—'} congestion`}</span>
                      </div>
                    </div>
                    <div className="text-slate-400 font-bold bg-slate-900/50 px-3 py-1 rounded-lg" aria-hidden="true">
                      {z.isClosed ? '🔒' : `${z.waitTime}m`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Wait Time Bar Chart */}
            {activeTab === 'chart' && (
              <section aria-labelledby="chart-heading" className="glass-panel rounded-2xl p-5">
                <h3 id="chart-heading" className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Wait Times by Zone (minutes)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }}
                      formatter={(val) => [`${val} min`, 'Wait Time']}
                    />
                    <Bar dataKey="wait" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={BAR_COLOR[entry.congestion] || '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-500 text-center mt-3">
                  🟢 Low &nbsp;🟡 Moderate &nbsp;🔴 High congestion — Updates every 4s
                </p>
              </section>
            )}
          </div>

          {/* Google Maps Venue Embed */}
          <section aria-labelledby="map-heading">
            <h2 id="map-heading" className="font-black text-lg mb-3 text-white flex items-center gap-2">
              📍 Venue — Narendra Modi Stadium, Ahmedabad
            </h2>
            <div className="rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl h-52">
              <iframe
                title="Venue location: Narendra Modi Stadium, Ahmedabad, India"
                src={VENUE_MAP_URL}
                width="100%" height="100%"
                style={{ border: 0 }}
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>
        </div>
      </main>

      {/* ── Floating Chat Button ── */}
      <button ref={chatBtnRef} onClick={() => setChatOpen(true)}
        aria-expanded={chatOpen} aria-haspopup="dialog" aria-label="Open venue AI chat" aria-controls="chat-panel"
        className="fixed bottom-8 right-8 bg-brand-500 hover:bg-brand-400 text-slate-950 p-5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-transform hover:scale-110 z-50">
        <MessageSquare aria-hidden="true" />
      </button>

      {/* ── Chat Panel ── */}
      {chatOpen && (
        <aside id="chat-panel" role="dialog" aria-modal="true" aria-label="Venue AI" onKeyDown={handleChatKeyDown}
          className="fixed bottom-28 right-8 w-80 glass-panel rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-brand-500/30">
          <div className="bg-brand-900/50 text-white p-4 font-bold flex justify-between items-center border-b border-brand-500/30">
            <span className="flex items-center gap-2"><Crown size={16} className="text-brand-400" aria-hidden="true" /> Venue AI</span>
            <button onClick={() => setChatOpen(false)} aria-label="Close chat" className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
          </div>
          <div role="log" aria-live="polite" aria-label="Chat messages" className="flex-1 p-4 overflow-y-auto min-h-[250px] max-h-[350px] bg-slate-950/50 flex flex-col gap-4 custom-scrollbar">
            {chatHistory.map((m, i) => (
              <div key={i}
                aria-label={`${m.role === 'user' ? 'You' : 'Venue AI'}: ${m.text}`}
                className={`p-3 rounded-xl text-sm max-w-[85%] leading-relaxed ${m.role === 'user' ? 'bg-brand-500 text-slate-950 font-semibold self-end rounded-br-none' : 'glass-panel text-slate-200 self-start rounded-bl-none'}`}>
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} aria-hidden="true" />
          </div>
          <form onSubmit={handleChat} className="p-3 border-t border-slate-800 flex gap-2 items-center bg-slate-900">
            <button type="button" aria-label="Voice input" className="text-brand-400 hover:text-brand-300 p-2"><Mic size={18} aria-hidden="true" /></button>
            <input ref={chatInputRef} id="chat-input" type="text" value={chatMsg} onChange={e => setChatMsg(e.target.value)}
              placeholder="Ask anything…" aria-label="Your message" className="flex-1 text-sm outline-none px-3 py-2 bg-slate-800 rounded-lg text-slate-200 focus:ring-1 ring-brand-500" />
            <button type="submit" aria-label="Send message" className="text-slate-900 bg-brand-500 hover:bg-brand-400 rounded-lg font-bold px-3 py-2">Send</button>
          </form>
        </aside>
      )}

      {/* ── Emergency Evacuation Modal ── */}
      {emergencyOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="emergency-title"
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl border-2 border-rose-500/50 shadow-[0_0_40px_rgba(225,29,72,0.3)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-rose-500/20 p-3 rounded-xl text-rose-400" aria-hidden="true"><Shield size={28} /></div>
              <h2 id="emergency-title" className="text-2xl font-black text-white">Emergency Guide</h2>
            </div>
            <p className="text-slate-400 text-sm mb-5">Enter your current location and get AI-powered evacuation instructions immediately.</p>

            <div className="mb-4">
              <label htmlFor="emergency-zone-input" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Your Current Location</label>
              <input id="emergency-zone-input" type="text" value={emergencyZone} onChange={e => setEmergencyZone(e.target.value)}
                placeholder='e.g. "Section 102", "North Concourse"'
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 transition-colors text-sm" />
            </div>

            <button onClick={requestEmergencyGuide} disabled={emergencyLoading || !emergencyZone.trim()}
              aria-busy={emergencyLoading}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-4 rounded-xl mb-4 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {emergencyLoading ? 'Generating guidance…' : '🚨 Get Evacuation Instructions'}
            </button>

            {emergencyGuide && (
              <div role="status" aria-live="assertive" className="bg-rose-950/40 border border-rose-500/30 text-rose-100 p-4 rounded-xl text-sm leading-relaxed mb-4 whitespace-pre-line">
                {emergencyGuide}
              </div>
            )}

            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mb-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Emergency Contacts</p>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-slate-400">Security</dt><dd className="text-rose-400 font-black">100</dd>
                <dt className="text-slate-400">Medical</dt><dd className="text-rose-400 font-black">108</dd>
                <dt className="text-slate-400">Silent Alert</dt><dd className="text-brand-400 font-black">Text SAFE → 55443</dd>
              </dl>
            </div>

            <button onClick={() => { setEmergencyOpen(false); setEmergencyGuide(''); setEmergencyZone(''); }}
              aria-label="Close emergency guide" className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityIcon(props) {
  return <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
}

function Widget({ title, val, icon, highlight }) {
  return (
    <div className={`p-5 rounded-2xl flex flex-col justify-between transition-all ${highlight ? 'bg-gradient-to-br from-brand-900 to-slate-900 border border-brand-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-white' : 'glass-panel text-slate-200'}`} aria-label={`${title}: ${val}`}>
      <div className={`text-xs uppercase font-black tracking-wider flex items-center gap-2 mb-3 ${highlight ? 'text-brand-400' : 'text-slate-400'}`} aria-hidden="true">{icon} {title}</div>
      <div className="text-3xl font-black truncate tracking-tighter" aria-hidden="true">{val}</div>
    </div>
  );
}
