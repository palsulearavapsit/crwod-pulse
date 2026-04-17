import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Shield, Zap, AlertTriangle, Send, Command, RefreshCw, Camera, Tag, ScanSearch, MessageCircleWarning, Briefcase, LogOut, Lock, Unlock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export default function AdminConsole() {
  const [state, setState] = useState({ zones: [], kpis: {} });
  const [alertText, setAlertText] = useState('');
  const [aiCommand, setAiCommand] = useState('');
  const [opsSummary, setOpsSummary] = useState('');
  const [anomalyTxt, setAnomalyTxt] = useState('');
  const [visionUploading, setVisionUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('state:update', (newState) => setState(newState));
    fetchState();
    return () => socket.disconnect();
  }, []);

  const fetchState = async () => {
    const res = await fetch(`${API_URL}/api/zones`);
    const data = await res.json();
    setState(s => ({ ...s, zones: data }));
  };

  const triggerScenario = async (scenario) => {
    await fetch(`${API_URL}/api/admin/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
  };

  const sendAlert = async (e) => {
    e.preventDefault();
    if(!alertText) return;
    await fetch(`${API_URL}/api/admin/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: alertText, severity: 'high' })
    });
    setAlertText('');
  };

  const generateAIAlert = async () => {
    const res = await fetch(`${API_URL}/api/ai/alert-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: 'north gate issue' })
    });
    const data = await res.json();
    setAlertText(data.text);
  };

  const executeNLCommand = async (e) => {
    e.preventDefault();
    if(!aiCommand) return;
    try {
      const res = await fetch(`${API_URL}/api/ai/nl-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: aiCommand })
      });
      const data = await res.json();
      if(data.action?.action) triggerScenario(data.action.action);
      setAiCommand('');
    } catch(err){}
  };

  const generateOpsSummary = async () => {
    const res = await fetch(`${API_URL}/api/ai/ops-summary`, { method: 'POST' });
    const data = await res.json();
    setOpsSummary(data.summary);
  };

  const detectAnomaly = async () => {
    const res = await fetch(`${API_URL}/api/ai/anomaly-detect`, { method: 'POST' });
    const data = await res.json();
    setAnomalyTxt(data.anomaly);
  };

  const mockLostAndFound = async () => {
    setVisionUploading(true);
    setTimeout(async () => {
      await fetch(`${API_URL}/api/ai/lost-and-found-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemDesc: 'Blue Nike Bag with red zipper' })
      });
      setAlertText("Gemini Vision: Bag successfully embedded into Lost & Found DB.");
      setVisionUploading(false);
    }, 1500);
  };

  const triggerFlashSale = async () => {
    await fetch(`${API_URL}/api/admin/flash-sale`, { method: 'POST' });
  };

  const mockVisionUpload = async () => {
    // This mocks taking a photo of a spill and Gemini generating a triage plan automatically
    setVisionUploading(true);
    setTimeout(async () => {
      await fetch(`${API_URL}/api/ai/incident-triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Spill near concourse 1' })
      });
      // simulate triaged
      setAlertText("Staff notice: Custodial dispatched to Burger Stand 1.");
      setVisionUploading(false);
    }, 1500);
  };

  const handleZoneUpdate = async (id, waitTime) => {
    await fetch(`${API_URL}/api/admin/update-zone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, waitTime: Number(waitTime) })
    });
  };

  const toggleZoneClosed = async (z) => {
    await fetch(`${API_URL}/api/admin/update-zone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: z.id, isClosed: !z.isClosed })
    });
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200">
      <header className="glass-panel text-white p-5 shadow-lg border-b border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-extrabold text-2xl flex items-center gap-3 tracking-tight">
          <Shield size={24} className="text-brand-400" /> Admin Command Center
        </h1>
        <button 
          onClick={() => { localStorage.removeItem('userRole'); navigate('/login'); }}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-rose-400 transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col - Scenarios */}
        <div className="lg:col-span-3 space-y-6">
          <section className="glass-panel p-5 rounded-2xl shadow-sm">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-white"><Zap size={20} className="text-amber-400"/> Live Senarios</h2>
            <div className="flex flex-col gap-3">
              <button onClick={()=>triggerScenario('halftime')} className="bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 p-3 rounded-xl text-sm font-bold tracking-wide transition-colors">Halftime Rush</button>
              <button onClick={()=>triggerScenario('gate-closure')} className="bg-rose-500/20 border border-rose-500/50 text-rose-400 hover:bg-rose-500/30 p-3 rounded-xl text-sm font-bold tracking-wide transition-colors">North Gate Closed</button>
              <button onClick={()=>triggerScenario('egress')} className="bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/30 p-3 rounded-xl text-sm font-bold tracking-wide transition-colors">Post-Game Egress</button>
              <button onClick={triggerFlashSale} className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 p-3 rounded-xl text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-2"><Tag size={18}/> AI Flash Sale</button>
              <button onClick={()=>triggerScenario('reset')} className="bg-slate-800 text-slate-300 hover:bg-slate-700 p-3 rounded-xl flex justify-center gap-2 text-sm font-bold transition-colors"><RefreshCw size={18}/> Reset Sim</button>
            </div>
          </section>

          <section className="glass-panel p-5 rounded-2xl shadow-sm">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-white"><Command size={20} className="text-brand-400"/> AI Ops Assistant</h2>
            
            <form onSubmit={executeNLCommand} className="mb-5">
              <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">Magic CLI</label>
              <div className="flex gap-2">
                <input type="text" value={aiCommand} onChange={e=>setAiCommand(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand-500" placeholder='e.g. "Close north gate"' />
                <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white p-3 rounded-lg transition-colors"><Send size={18}/></button>
              </div>
            </form>

            <button onClick={generateOpsSummary} className="w-full bg-brand-900/40 border border-brand-500/50 hover:bg-brand-900/60 text-brand-300 font-bold py-3 rounded-xl text-sm mb-3 transition-colors">
              Generate AI State Summary
            </button>
            {opsSummary && <div className="p-4 bg-brand-500/10 border border-brand-500/30 text-brand-200 text-sm rounded-xl mb-4 leading-relaxed">{opsSummary}</div>}

            <button onClick={detectAnomaly} className="w-full bg-orange-900/40 border border-orange-500/50 hover:bg-orange-900/60 text-orange-300 font-bold py-3 rounded-xl text-sm mb-3 flex justify-center items-center gap-2 transition-colors">
              <ScanSearch size={18}/> Gemini Anomaly Scan
            </button>
            {anomalyTxt && <div className="p-4 bg-orange-500/10 border border-orange-500/30 text-orange-200 text-sm rounded-xl mb-4 leading-relaxed">{anomalyTxt}</div>}
            
            <button onClick={mockVisionUpload} disabled={visionUploading} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 mb-3 transition-colors">
              <Camera size={18}/> {visionUploading ? 'AI Analyzing...' : 'Staff: Upload Vision Incident'}
            </button>

            <button onClick={mockLostAndFound} disabled={visionUploading} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
              <Briefcase size={18}/> {visionUploading ? 'Syncing...' : 'Staff: Sync Found Item'}
            </button>
          </section>
        </div>

        {/* Mid Col - Live State */}
        <div className="lg:col-span-6 space-y-6">
          <section className="glass-panel p-6 rounded-2xl shadow-sm h-full flex flex-col">
            <h2 className="font-extrabold text-xl mb-4 text-white">Venue Control Mapping</h2>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {state.zones.map(z => (
                <div key={z.id} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-600 transition-colors">
                  <div className="font-bold text-sm truncate pr-2 text-slate-300" title={z.name}>
                    {z.name} {z.isClosed && <span className="text-rose-500 font-black ml-2 uppercase text-[10px]">CLOSED</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleZoneClosed(z)}
                      className={`p-1.5 rounded-lg border-2 transition-colors flex items-center justify-center ${z.isClosed ? 'border-rose-500 bg-rose-500/20 text-rose-500' : 'border-slate-700 bg-slate-800 text-slate-500 hover:text-white hover:border-slate-500'}`}
                      title={z.isClosed ? "Click to Re-Open Zone" : "Click to Close Zone"}
                    >
                      {z.isClosed ? <Lock size={16}/> : <Unlock size={16}/>}
                    </button>
                    
                    {!z.isClosed ? (
                      <>
                        <input 
                          type="number" 
                          min="0"
                          key={`${z.id}-${z.congestion}`} 
                          defaultValue={z.waitTime}
                          onBlur={(e) => handleZoneUpdate(z.id, e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                          className={`w-16 px-1 py-1.5 rounded-lg text-sm font-black text-center border-2 border-slate-700 bg-slate-800 outline-none focus:border-brand-500 focus:bg-slate-900 transition-colors shadow-inner
                            ${z.congestion==='red'?'text-rose-400':z.congestion==='yellow'?'text-amber-400':'text-emerald-400'}
                          `}
                        />
                        <span className="text-xs font-bold text-slate-500">m</span>
                      </>
                    ) : (
                      <div className="w-16 px-1 py-1.5 rounded-lg text-sm font-black text-center border-2 border-rose-500/30 bg-rose-950/30 text-rose-500">--</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Col - Comms */}
        <div className="lg:col-span-3 space-y-6">
          <section className="glass-panel p-5 rounded-2xl shadow-sm">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-white"><AlertTriangle size={20} className="text-rose-500"/> Push Global Alert</h2>
            <form onSubmit={sendAlert}>
              <textarea 
                value={alertText} onChange={e=>setAlertText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 mb-3 h-28 focus:outline-none focus:border-rose-500 resize-none" placeholder="Enter alert message to broadcast..."
              ></textarea>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={generateAIAlert} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold py-3 rounded-xl transition-colors">AI Enhance Drafting</button>
                <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-colors">Broadcast Live</button>
              </div>
            </form>
          </section>
          
          <section className="glass-panel p-5 rounded-2xl shadow-sm">
             <h2 className="font-bold text-lg mb-4 text-white">Live KPIs</h2>
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1">Avg Wait</div>
                  <div className="text-2xl font-black text-brand-400">{state.kpis?.averageWait || 0}<span className="text-sm text-slate-500 ml-1">m</span></div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1">Alerts</div>
                  <div className="text-2xl font-black text-rose-400">{state.kpis?.activeAlerts || 0}</div>
                </div>
             </div>

             <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-3">Active Attendee Tiers</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-300">🎟️ General Admission</span>
                    <span className="text-white">41,250</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-blue-400">🛡️ VIP Premium</span>
                    <span className="text-white">3,420</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-800">
                    <span className="text-amber-400">👑 Platinum Elite</span>
                    <span className="text-white">820</span>
                  </div>
                </div>
             </div>
          </section>

          <section className="glass-panel p-5 rounded-2xl shadow-sm">
             <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-white"><MessageCircleWarning size={20} className="text-indigo-400"/> Sentiment</h2>
             <button onClick={async () => {
                const res = await fetch(`${API_URL}/api/ai/sentiment`, { method: 'POST' });
                const data = await res.json();
                setAlertText(`[Gemini Massive Context Summarization] Score: ${data.score}/10. Top Complaint: ${data.topComplaint}. Trend: ${data.trend}.`);
             }} className="w-full bg-indigo-900/30 border border-indigo-500/40 hover:bg-indigo-900/50 text-indigo-300 font-bold py-3 rounded-xl text-sm transition-colors">
                Run Multi-Doc Scan
             </button>
          </section>
        </div>

      </main>
    </div>
  )
}
