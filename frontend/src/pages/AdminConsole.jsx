import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Shield, Zap, AlertTriangle, Send, Command, RefreshCw, Camera, Tag, ScanSearch, MessageCircleWarning, Briefcase, LogOut, Lock, Unlock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL    = import.meta.env.VITE_API_URL    || 'http://localhost:3000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Admin token — in production this would come from a proper auth flow
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_SECRET || 'crowdpulse-admin-2024';

const adminHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
};

/**
 * AdminConsole component serves as the command center for venue operations.
 * It provides tools to manage zones, simulate scenarios, execute AI ops, and push alerts.
 * @returns {JSX.Element} The rendered admin dashboard.
 */
export default function AdminConsole() {
  const [state, setState]             = useState({ zones: [], kpis: {} });
  const [alertText, setAlertText]     = useState('');
  const [aiCommand, setAiCommand]     = useState('');
  const [opsSummary, setOpsSummary]   = useState('');
  const [anomalyTxt, setAnomalyTxt]   = useState('');
  const [predictionTxt, setPredictionTxt] = useState('');
  const [visionBusy, setVisionBusy]   = useState(false);
  const [toast, setToast]             = useState(null); // { type, message }
  const navigate = useNavigate();

  /**
   * Displays a toast notification in the UI.
   * @param {string} type - The type of toast ('success', 'error', 'info').
   * @param {string} message - The message body to display.
   */
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('state:update', (newState) => setState(newState));
    fetchState();
    return () => socket.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Fetches the initial live venue zone data from the backend.
   */
  const fetchState = async () => {
    try {
      const res  = await fetch(`${API_URL}/api/zones`);
      const data = await res.json();
      setState(s => ({ ...s, zones: data }));
    } catch { showToast('error', 'Could not fetch venue state.'); }
  };

  /**
   * Triggers a specific venue scenario to test system routing.
   * @param {string} scenario - The scenario ID, e.g. 'halftime' or 'gate-closure'.
   */
  const triggerScenario = async (scenario) => {
    await fetch(`${API_URL}/api/admin/scenario`, {
      method: 'POST', headers: adminHeaders,
      body: JSON.stringify({ scenario })
    });
  };

  /**
   * Sends a global emergency or promotional alert to all connected attendees.
   * @param {React.FormEvent} e - Form submission event.
   */
  const sendAlert = async (e) => {
    e.preventDefault();
    if (!alertText.trim()) return;
    await fetch(`${API_URL}/api/admin/alert`, {
      method: 'POST', headers: adminHeaders,
      body: JSON.stringify({ message: alertText, severity: 'high' })
    });
    setAlertText('');
    showToast('success', 'Alert broadcasted to all attendees.');
  };

  const generateAIAlert = async () => {
    const res  = await fetch(`${API_URL}/api/ai/alert-generate`, {
      method: 'POST', headers: adminHeaders,
      body: JSON.stringify({ rawText: 'north gate issue' })
    });
    const data = await res.json();
    setAlertText(data.text);
  };

  const executeNLCommand = async (e) => {
    e.preventDefault();
    if (!aiCommand.trim()) return;
    try {
      const res  = await fetch(`${API_URL}/api/ai/nl-command`, {
        method: 'POST', headers: adminHeaders,
        body: JSON.stringify({ command: aiCommand })
      });
      const data = await res.json();
      if (data.action?.action) await triggerScenario(data.action.action);
      setAiCommand('');
      showToast('success', `Command executed: ${data.action?.action || 'processed'}`);
    } catch { showToast('error', 'Failed to execute command.'); }
  };

  const generateOpsSummary = async () => {
    const res  = await fetch(`${API_URL}/api/ai/ops-summary`, { method: 'POST', headers: adminHeaders });
    const data = await res.json();
    setOpsSummary(data.summary);
  };

  /**
   * Request Gemini to detect venue anomalies
   */
  const detectAnomaly = async () => {
    const res  = await fetch(`${API_URL}/api/ai/anomaly-detect`, { method: 'POST', headers: adminHeaders });
    const data = await res.json();
    setAnomalyTxt(data.anomaly);
  };

  /**
   * Request Gemini for AI Crowd Predictions based on live metrics
   */
  const getSimulatedPrediction = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ai/crowd-predictions`, {
        method: 'POST', headers: adminHeaders,
        body: JSON.stringify({ zones: state.zones })
      });
      const data = await res.json();
      setPredictionTxt(data.prediction);
    } catch { showToast('error', 'Failed to fetch crowd prediction.'); }
  };

  const mockLostAndFound = async () => {
    setVisionBusy(true);
    try {
      await fetch(`${API_URL}/api/ai/lost-and-found-upload`, {
        method: 'POST', headers: adminHeaders,
        body: JSON.stringify({ itemDesc: 'Blue Nike Bag with red zipper' })
      });
      showToast('success', 'Gemini Vision: Bag logged in Lost & Found database.');
    } finally { setVisionBusy(false); }
  };

  const triggerFlashSale = async () => {
    await fetch(`${API_URL}/api/admin/flash-sale`, { method: 'POST', headers: adminHeaders });
    showToast('success', 'Flash sale alert sent to all attendees!');
  };

  const mockVisionUpload = async () => {
    setVisionBusy(true);
    try {
      await fetch(`${API_URL}/api/ai/incident-triage`, {
        method: 'POST', headers: adminHeaders,
        body: JSON.stringify({ description: 'Spill near concourse 1' })
      });
      showToast('success', 'Staff notice: Custodial dispatched to Burger Stand 1.');
    } finally { setVisionBusy(false); }
  };

  const handleZoneUpdate = async (id, waitTime) => {
    await fetch(`${API_URL}/api/admin/update-zone`, {
      method: 'POST', headers: adminHeaders,
      body: JSON.stringify({ id, waitTime: Number(waitTime) })
    });
  };

  const toggleZoneClosed = async (z) => {
    await fetch(`${API_URL}/api/admin/update-zone`, {
      method: 'POST', headers: adminHeaders,
      body: JSON.stringify({ id: z.id, isClosed: !z.isClosed })
    });
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200">

      {/* Skip to main */}
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-brand-500 text-slate-950 px-4 py-2 rounded-xl font-bold z-50">
        Skip to content
      </a>

      <header className="glass-panel text-white p-5 shadow-lg border-b border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-extrabold text-2xl flex items-center gap-3 tracking-tight">
          <Shield size={24} className="text-brand-400" aria-hidden="true" /> Admin Command Center
        </h1>
        <button
          onClick={() => { localStorage.removeItem('userRole'); navigate('/login'); }}
          aria-label="Sign out and return to login"
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-rose-400 transition-colors"
        >
          <LogOut size={18} aria-hidden="true" /> Sign Out
        </button>
      </header>

      {/* Toast */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className={`mx-6 mt-4 flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold
            ${toast.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' : 'bg-rose-500/15 border-rose-500/40 text-rose-200'}`}
        >
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} aria-label="Dismiss notification" className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      <main id="admin-main" className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Col — Scenarios */}
        <div className="lg:col-span-3 space-y-6">
          <section aria-labelledby="scenarios-heading" className="glass-panel p-5 rounded-2xl shadow-sm">
            <h2 id="scenarios-heading" className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
              <Zap size={20} className="text-amber-400" aria-hidden="true" /> Live Scenarios
            </h2>
            <div className="flex flex-col gap-3" role="group" aria-label="Venue scenario controls">
              <button onClick={() => triggerScenario('halftime')}    aria-label="Trigger halftime rush scenario"      className="bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 p-3 rounded-xl text-sm font-bold tracking-wide transition-colors">Halftime Rush</button>
              <button onClick={() => triggerScenario('gate-closure')} aria-label="Trigger north gate closure scenario" className="bg-rose-500/20 border border-rose-500/50 text-rose-400 hover:bg-rose-500/30 p-3 rounded-xl text-sm font-bold tracking-wide transition-colors">North Gate Closed</button>
              <button onClick={() => triggerScenario('egress')}      aria-label="Trigger post-game egress scenario"   className="bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/30 p-3 rounded-xl text-sm font-bold tracking-wide transition-colors">Post-Game Egress</button>
              <button onClick={triggerFlashSale}                     aria-label="Trigger AI flash sale on concessions" className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 p-3 rounded-xl text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-2">
                <Tag size={18} aria-hidden="true" /> AI Flash Sale
              </button>
              <button onClick={() => triggerScenario('reset')}       aria-label="Reset simulation to default state"   className="bg-slate-800 text-slate-300 hover:bg-slate-700 p-3 rounded-xl flex justify-center gap-2 text-sm font-bold transition-colors">
                <RefreshCw size={18} aria-hidden="true" /> Reset Sim
              </button>
            </div>
          </section>

          <section aria-labelledby="ai-ops-heading" className="glass-panel p-5 rounded-2xl shadow-sm">
            <h2 id="ai-ops-heading" className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
              <Command size={20} className="text-brand-400" aria-hidden="true" /> AI Ops Assistant
            </h2>

            <form onSubmit={executeNLCommand} className="mb-5" aria-label="Natural language command input">
              <label htmlFor="nl-command-input" className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">Magic CLI</label>
              <div className="flex gap-2">
                <input
                  id="nl-command-input"
                  type="text"
                  value={aiCommand}
                  onChange={e => setAiCommand(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand-500"
                  placeholder='e.g. "Close north gate"'
                />
                <button type="submit" aria-label="Execute command" className="bg-brand-600 hover:bg-brand-500 text-white p-3 rounded-lg transition-colors">
                  <Send size={18} aria-hidden="true" />
                </button>
              </div>
            </form>

            <button onClick={generateOpsSummary} aria-label="Generate AI operations summary" className="w-full bg-brand-900/40 border border-brand-500/50 hover:bg-brand-900/60 text-brand-300 font-bold py-3 rounded-xl text-sm mb-3 transition-colors">
              Generate AI State Summary
            </button>
            {opsSummary && <div role="status" className="p-4 bg-brand-500/10 border border-brand-500/30 text-brand-200 text-sm rounded-xl mb-4 leading-relaxed">{opsSummary}</div>}

            <button onClick={detectAnomaly} aria-label="Run Gemini anomaly scan on venue data" className="w-full bg-orange-900/40 border border-orange-500/50 hover:bg-orange-900/60 text-orange-300 font-bold py-3 rounded-xl text-sm mb-3 flex justify-center items-center gap-2 transition-colors">
              <ScanSearch size={18} aria-hidden="true" /> Gemini Anomaly Scan
            </button>
            {anomalyTxt && <div role="status" className="p-4 bg-orange-500/10 border border-orange-500/30 text-orange-200 text-sm rounded-xl mb-4 leading-relaxed">{anomalyTxt}</div>}

            <button onClick={getSimulatedPrediction} aria-label="Run Gemini Crowd Prediction on active zones" className="w-full bg-indigo-900/40 border border-indigo-500/50 hover:bg-indigo-900/60 text-indigo-300 font-bold py-3 rounded-xl text-sm mb-3 flex justify-center items-center gap-2 transition-colors">
              AI Crowd Predictions
            </button>
            {predictionTxt && <div role="status" className="p-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-sm rounded-xl mb-4 leading-relaxed mt-2">{predictionTxt}</div>}

            <button onClick={mockVisionUpload} disabled={visionBusy} aria-label="Upload vision incident for AI triage" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 mb-3 transition-colors disabled:opacity-50">
              <Camera size={18} aria-hidden="true" /> {visionBusy ? 'AI Analyzing…' : 'Staff: Upload Vision Incident'}
            </button>
            <button onClick={mockLostAndFound} disabled={visionBusy} aria-label="Sync found item to lost and found database" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              <Briefcase size={18} aria-hidden="true" /> {visionBusy ? 'Syncing…' : 'Staff: Sync Found Item'}
            </button>
          </section>
        </div>

        {/* Mid Col — Venue Mapping */}
        <div className="lg:col-span-6 space-y-6">
          <section aria-labelledby="venue-map-heading" className="glass-panel p-6 rounded-2xl shadow-sm h-full flex flex-col">
            <h2 id="venue-map-heading" className="font-extrabold text-xl mb-4 text-white">Venue Control Mapping</h2>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2" role="list" aria-label="Venue zone controls">
              {state.zones.map(z => (
                <div key={z.id} role="listitem" className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-600 transition-colors">
                  <div className="font-bold text-sm truncate pr-2 text-slate-300" title={z.name}>
                    {z.name}
                    {z.isClosed && <span className="text-rose-500 font-black ml-2 uppercase text-[10px]" aria-label="Zone closed">CLOSED</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleZoneClosed(z)}
                      aria-label={z.isClosed ? `Re-open ${z.name}` : `Close ${z.name}`}
                      aria-pressed={z.isClosed}
                      className={`p-1.5 rounded-lg border-2 transition-colors flex items-center justify-center ${z.isClosed ? 'border-rose-500 bg-rose-500/20 text-rose-500' : 'border-slate-700 bg-slate-800 text-slate-500 hover:text-white hover:border-slate-500'}`}
                    >
                      {z.isClosed ? <Lock size={16} aria-hidden="true" /> : <Unlock size={16} aria-hidden="true" />}
                    </button>

                    {!z.isClosed ? (
                      <>
                        <label htmlFor={`wait-${z.id}`} className="sr-only">Wait time for {z.name} in minutes</label>
                        <input
                          id={`wait-${z.id}`}
                          type="number"
                          min="0"
                          max="120"
                          key={`${z.id}-${z.congestion}`}
                          defaultValue={z.waitTime}
                          onBlur={(e) => handleZoneUpdate(z.id, e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                          aria-label={`Wait time for ${z.name}`}
                          className={`w-16 px-1 py-1.5 rounded-lg text-sm font-black text-center border-2 border-slate-700 bg-slate-800 outline-none focus:border-brand-500 focus:bg-slate-900 transition-colors shadow-inner
                            ${z.congestion === 'red' ? 'text-rose-400' : z.congestion === 'yellow' ? 'text-amber-400' : 'text-emerald-400'}`}
                        />
                        <span className="text-xs font-bold text-slate-500" aria-hidden="true">m</span>
                      </>
                    ) : (
                      <div className="w-16 px-1 py-1.5 rounded-lg text-sm font-black text-center border-2 border-rose-500/30 bg-rose-950/30 text-rose-500" aria-hidden="true">--</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Col — Comms */}
        <div className="lg:col-span-3 space-y-6">
          <section aria-labelledby="alert-heading" className="glass-panel p-5 rounded-2xl shadow-sm">
            <h2 id="alert-heading" className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
              <AlertTriangle size={20} className="text-rose-500" aria-hidden="true" /> Push Global Alert
            </h2>
            <form onSubmit={sendAlert} aria-label="Broadcast alert form">
              <label htmlFor="alert-textarea" className="sr-only">Alert message to broadcast</label>
              <textarea
                id="alert-textarea"
                value={alertText}
                onChange={e => setAlertText(e.target.value)}
                aria-label="Alert message"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 mb-3 h-28 focus:outline-none focus:border-rose-500 resize-none"
                placeholder="Enter alert message to broadcast…"
              />
              <div className="flex flex-col gap-2">
                <button type="button" onClick={generateAIAlert} aria-label="Use AI to enhance alert draft" className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold py-3 rounded-xl transition-colors">AI Enhance Drafting</button>
                <button type="submit" aria-label="Broadcast alert to all attendees" className="w-full bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-colors">Broadcast Live</button>
              </div>
            </form>
          </section>

          <section aria-labelledby="kpi-heading" className="glass-panel p-5 rounded-2xl shadow-sm">
            <h2 id="kpi-heading" className="font-bold text-lg mb-4 text-white">Live KPIs</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center" aria-label={`Average wait: ${state.kpis?.averageWait || 0} minutes`}>
                <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1" aria-hidden="true">Avg Wait</div>
                <div className="text-2xl font-black text-brand-400" aria-hidden="true">{state.kpis?.averageWait || 0}<span className="text-sm text-slate-500 ml-1">m</span></div>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center" aria-label={`Active alerts: ${state.kpis?.activeAlerts || 0}`}>
                <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1" aria-hidden="true">Alerts</div>
                <div className="text-2xl font-black text-rose-400" aria-hidden="true">{state.kpis?.activeAlerts || 0}</div>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-3">Active Attendee Tiers</div>
              <dl className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <dt className="text-slate-300">🎟️ General Admission</dt><dd className="text-white">41,250</dd>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <dt className="text-blue-400">🛡️ VIP Premium</dt><dd className="text-white">3,420</dd>
                </div>
                <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-800">
                  <dt className="text-amber-400">👑 Platinum Elite</dt><dd className="text-white">820</dd>
                </div>
              </dl>
            </div>
          </section>

          <section aria-labelledby="sentiment-heading" className="glass-panel p-5 rounded-2xl shadow-sm">
            <h2 id="sentiment-heading" className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
              <MessageCircleWarning size={20} className="text-indigo-400" aria-hidden="true" /> Sentiment
            </h2>
            <button
              aria-label="Run multi-document sentiment scan"
              onClick={async () => {
                const res  = await fetch(`${API_URL}/api/ai/sentiment`, { method: 'POST', headers: adminHeaders });
                const data = await res.json();
                showToast('info', `[Gemini] Score: ${data.score}/10 · ${data.topComplaint} · Trend: ${data.trend}`);
              }}
              className="w-full bg-indigo-900/30 border border-indigo-500/40 hover:bg-indigo-900/50 text-indigo-300 font-bold py-3 rounded-xl text-sm transition-colors"
            >
              Run Multi-Doc Scan
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
