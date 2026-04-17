import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { MapPin, Navigation, Clock, MessageSquare, Mic, Volume2, Compass, Crown, CreditCard, ArrowUpCircle, LogOut, Map, Users, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export default function AttendeeDashboard() {
  const [state, setState] = useState({ zones: [], alerts: [], kpis: {} });
  const [recommendations, setRecommendations] = useState(null);
  const [accessibleMode, setAccessibleMode] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([{ role: 'bot', text: 'Hi! I am your Venue AI. How can I help?' }]);
  const isVip = localStorage.getItem('vipStatus') === 'active';
  const [arCompass, setArCompass] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('state:update', (newState) => setState(newState));
    socket.on('alert:new', (alert) => {
      setState(prev => ({ ...prev, alerts: [alert, ...prev.alerts].slice(0,5) }));
    });
    
    fetchRecommendations();
    const interval = setInterval(fetchRecommendations, 5000);

    return () => { socket.disconnect(); clearInterval(interval); };
  }, []); // Run once on mount

  const fetchRecommendations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/recommendations?vip=${isVip}`);
      const data = await res.json();
      setRecommendations(data);
    } catch(e) { console.error(e) }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if(!chatMsg.trim()) return;
    const userMsg = chatMsg;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMsg('');
    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch(e) {
      setChatHistory(prev => [...prev, { role: 'bot', text: "Sorry, I'm offline right now." }]);
    }
  };

  const toggleTranslateAlerts = async () => {
    if(state.alerts.length === 0) return;
    setIsTranslating(true);
    const topAlert = state.alerts[0];
    try {
      const res = await fetch(`${API_URL}/api/ai/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: topAlert.message, targetLang: 'es' })
      });
      const data = await res.json();
      alert(`[Translated/ES] ${data.translation}`);
    } catch(e) {}
    setIsTranslating(false);
  };

  return (
    <div className="bg-slate-950 min-h-screen pb-20 relative text-slate-200">
      <header className="glass-panel text-white p-4 sticky top-0 z-10 flex justify-between items-center shadow-lg">
        <h1 className="font-bold text-xl flex items-center gap-2">
          <ActivityIcon /> CrowdPulse
        </h1>
        <div className="flex items-center gap-6 text-sm">
          <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-300">
            <input type="checkbox" checked={accessibleMode} onChange={(e)=>setAccessibleMode(e.target.checked)} className="rounded" />
            Accessible Route
          </label>
          <button 
            onClick={() => { localStorage.removeItem('userRole'); localStorage.removeItem('vipStatus'); navigate('/login'); }}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </header>
      
      {/* VIP Status Banner Active */}
      {isVip && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-900 border-b border-amber-500/50 p-2 text-xs flex justify-center items-center px-4 font-black tracking-widest uppercase text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          <Crown size={16} className="text-amber-300 mr-2"/> Premium Routing Active
        </div>
      )}

      {state.alerts.length > 0 && (
        <div className="bg-red-500 text-white p-3 flex justify-between items-center px-4 shadow-sm relative z-0">
          <div className="flex gap-2 items-center text-sm font-semibold">
            <span>⚠️ {state.alerts[0].message}</span>
          </div>
          <button onClick={toggleTranslateAlerts} disabled={isTranslating} className="text-xs bg-red-700 hover:bg-red-800 px-2 py-1 rounded">
            {isTranslating ? '...' : 'EN/ES'}
          </button>
        </div>
      )}

      <main className="p-4 max-w-5xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Widgets & Route */}
        <div className="md:col-span-5 space-y-6">
          
          {/* AI Route Banner Asymmetrical */}
          <div className="glass-panel border-brand-500/30 rounded-2xl p-6 flex flex-col gap-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
            <div className="flex gap-4 items-start z-10">
              <div className="bg-brand-500/20 p-3 rounded-xl text-brand-400 shadow-inner"><MapPin size={24}/></div>
              <div>
                <h3 className="font-extrabold text-white text-lg mb-1 tracking-wide">AI Smart Route</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {recommendations?.lowCrowdRoute} 
                  {accessibleMode && " (Priority elevators selected)."}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setArCompass(!arCompass)} 
              className="w-full mt-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white p-4 rounded-xl text-sm font-black tracking-widest flex justify-center items-center gap-2 z-10 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              <Compass size={20} className={arCompass ? "animate-spin" : ""} /> 
              {arCompass ? 'AR COMPASS ACTIVE' : 'START AR WAYFINDING'}
            </button>
            
            {arCompass && (
               <div className="absolute inset-0 bg-brand-500/10 pointer-events-none z-0 animate-pulse"></div>
            )}
          </div>

          {/* Top Widgets Grid (Asymmetrical) */}
          <div className="grid grid-cols-2 gap-4">
            <Widget title="Best Gate" val={recommendations?.bestGate?.name || 'Loading'} icon={<Navigation size={18}/>} highlight />
            <Widget title="Fastest Snack" val={recommendations?.fastestConcession?.name || 'Loading'} icon={<MapPin size={18}/>} />
            <Widget title="Avg Wait" val={`${state.kpis?.averageWait || 0} min`} icon={<Clock size={18}/>} />
            <Widget title="Time Saved" val={`${state.kpis?.timeSavedTotal || 0} min`} icon={<ActivityIcon size={18}/>} highlight={true} />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Link to="/concessions" className="glass-panel text-white hover:bg-slate-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm group">
              <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400 group-hover:scale-110 transition-transform"><CreditCard size={24}/></div>
              <span className="font-bold text-sm text-center">Mobile Express Order</span>
            </Link>
            <Link to="/upgrade" className="glass-panel text-white hover:bg-slate-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm group">
              <div className="bg-amber-500/20 p-3 rounded-full text-amber-400 group-hover:scale-110 transition-transform"><ArrowUpCircle size={24}/></div>
              <span className="font-bold text-sm text-center">Upgrade Pass</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Live Map / Queue Board */}
        <div className="md:col-span-7">
          <h2 className="font-black text-2xl mb-4 text-white tracking-tight flex items-center gap-2">
            <ActivityIcon className="text-brand-500" /> Live Venue Status
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {state.zones.map(z => (
              <div key={z.id} className={`p-4 rounded-2xl border glass-panel flex justify-between items-center transition-all hover:scale-[1.02]
                ${z.congestion==='red'?'border-rose-500/30 bg-rose-950/20': z.congestion==='yellow'?'border-amber-400/30 bg-amber-950/20':'border-emerald-500/30 bg-emerald-950/20'}`}>
                <div className="flex items-center gap-3">
                  <div className={`map-zone w-3 h-3 rounded-full ${z.congestion}`}></div>
                  <span className="font-bold text-slate-200">{z.name}</span>
                </div>
                <div className="text-slate-400 font-bold bg-slate-900/50 px-3 py-1 rounded-lg">{z.waitTime}m</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Chat Button */}
      <button 
        onClick={()=>setChatOpen(!chatOpen)}
        className="fixed bottom-8 right-8 bg-brand-500 hover:bg-brand-400 text-slate-950 p-5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-transform hover:scale-110 z-50"
      >
        <MessageSquare />
      </button>

      {/* Chatbot Overlay */}
      {chatOpen && (
        <div className="fixed bottom-28 right-8 w-80 glass-panel rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-brand-500/30">
          <div className="bg-brand-900/50 text-white p-4 font-bold flex justify-between items-center border-b border-brand-500/30">
            <span className="flex items-center gap-2"><Crown size={16} className="text-brand-400"/> Venue AI</span>
            <button onClick={()=>setChatOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto min-h-[250px] max-h-[350px] bg-slate-950/50 flex flex-col gap-4">
            {chatHistory.map((m,i) => (
              <div key={i} className={`p-3 rounded-xl text-sm max-w-[85%] leading-relaxed ${m.role==='user'?'bg-brand-500 text-slate-950 font-semibold self-end rounded-br-none shadow-[0_0_10px_rgba(16,185,129,0.3)]':'glass-panel text-slate-200 self-start rounded-bl-none'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleChat} className="p-3 border-t border-slate-800 flex gap-2 items-center bg-slate-900">
            <button type="button" className="text-brand-400 hover:text-brand-300 p-2"><Mic size={18}/></button>
            <input 
              type="text" value={chatMsg} onChange={e=>setChatMsg(e.target.value)}
              placeholder="Ask anything..." className="flex-1 text-sm outline-none px-3 py-2 bg-slate-800 rounded-lg text-slate-200 focus:ring-1 ring-brand-500"
            />
            <button type="submit" className="text-slate-900 bg-brand-500 hover:bg-brand-400 rounded-lg font-bold px-3 py-2">Send</button>
          </form>
        </div>
      )}
    </div>
  )
}

function ActivityIcon(props) {
  return <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
}

function Widget({ title, val, icon, highlight }) {
  return (
    <div className={`p-5 rounded-2xl flex flex-col justify-between transition-all ${highlight ? 'bg-gradient-to-br from-brand-900 to-slate-900 border border-brand-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-white' : 'glass-panel text-slate-200'}`}>
      <div className={`text-xs uppercase font-black tracking-wider flex items-center gap-2 mb-3 ${highlight ? 'text-brand-400' : 'text-slate-400'}`}>
        {icon} {title}
      </div>
      <div className="text-3xl font-black truncate tracking-tighter">{val}</div>
    </div>
  );
}
