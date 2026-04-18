import React, { useState, useEffect } from 'react';
import { Shield, Zap, AlertTriangle, Send, Command, RefreshCw, Camera, Tag, ScanSearch, MessageCircleWarning, Briefcase, LogOut, Lock, Unlock, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
import { VenueState, Zone } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_SECRET || 'crowdpulse-admin-2024';

const adminHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
};

const AdminConsole: React.FC = () => {
  const [state, setState] = useState<VenueState>({ zones: [], alerts: [], kpis: {} });
  const [aiCommand, setAiCommand] = useState('');
  const [opsSummary, setOpsSummary] = useState('');
  const [predictionTxt, setPredictionTxt] = useState('');
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    socketService.connect();
    socketService.onStateUpdate((s) => setState(s));
    fetchState();
    return () => socketService.disconnect();
  }, []);

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchState = async () => {
    try {
      const res = await fetch(`${API_URL}/api/zones`);
      const data = await res.json();
      setState(s => ({ ...s, zones: data }));
    } catch { showToast('error', 'Could not sync state.'); }
  };

  const triggerScenario = async (scenario: string) => {
    await fetch(`${API_URL}/api/admin/scenario`, {
      method: 'POST', headers: adminHeaders,
      body: JSON.stringify({ scenario })
    });
    showToast('success', `Scenario ${scenario} activated.`);
  };

  const triggerStressTest = async () => {
    await fetch(`${API_URL}/api/admin/stress-test`, { method: 'POST', headers: adminHeaders });
    showToast('info', 'High-velocity synthetic stress test initiated.');
  };

  const runDeepAnalysis = async () => {
    const res = await fetch(`${API_URL}/api/ai/deep-analysis`, { method: 'POST', headers: adminHeaders });
    const data = await res.json();
    setOpsSummary(data.analysis);
  };

  const getPrediction = async () => {
    const res = await fetch(`${API_URL}/api/ai/crowd-predictions`, {
      method: 'POST', headers: adminHeaders,
      body: JSON.stringify({ zones: state.zones })
    });
    const data = await res.json();
    setPredictionTxt(data.prediction);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200">
      <header className="glass-panel text-white p-5 border-b border-brand-500/20 flex items-center justify-between">
        <h1 className="font-extrabold text-2xl flex items-center gap-3">
          <Shield size={24} className="text-brand-400" /> Ops Command Center
        </h1>
        <button onClick={() => navigate('/login')} className="text-slate-400 hover:text-rose-400 flex items-center gap-2">
          <LogOut size={18} /> Sign Out
        </button>
      </header>

      {toast && (
        <div className={`mx-6 mt-4 p-4 rounded-xl border text-sm font-semibold ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-brand-500/10 border-brand-500/30 text-brand-300'}`}>
          {toast.message}
        </div>
      )}

      <main className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <section className="glass-panel p-5 rounded-2xl">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
              <Zap size={20} className="text-amber-400" /> Scenarios
            </h2>
            <div className="flex flex-col gap-3">
              <button onClick={() => triggerScenario('halftime')} className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded-xl text-xs font-bold">Halftime Surge</button>
              <button onClick={() => triggerScenario('egress')} className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 p-3 rounded-xl text-xs font-bold">Post-Game Egress</button>
              <button onClick={() => triggerScenario('reset')} className="bg-slate-800 text-slate-300 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                <RefreshCw size={14} /> Reset Simulation
              </button>
              <button onClick={triggerStressTest} className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                <Play size={14} /> Run Stress Test
              </button>
            </div>
          </section>

          <section className="glass-panel p-5 rounded-2xl">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
              <Command size={20} className="text-brand-400" /> AI Insights
            </h2>
            <button onClick={runDeepAnalysis} className="w-full bg-brand-900/40 border border-brand-500/50 text-brand-300 font-bold py-3 rounded-xl text-xs mb-3">
              Gemini 1.5 Pro: Pattern Analysis
            </button>
            {opsSummary && <div className="p-4 bg-brand-500/5 border border-brand-500/20 text-brand-200 text-xs rounded-xl mb-4 leading-relaxed">{opsSummary}</div>}
            
            <button onClick={getPrediction} className="w-full bg-indigo-900/40 border border-indigo-500/50 text-indigo-300 font-bold py-3 rounded-xl text-xs mb-3">
              AI Crowd Flow Prediction
            </button>
            {predictionTxt && <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 text-indigo-200 text-xs rounded-xl mb-4 leading-relaxed">{predictionTxt}</div>}
          </section>
        </div>

        <div className="lg:col-span-9">
          <section className="glass-panel p-6 rounded-2xl h-full">
            <h2 className="font-extrabold text-xl mb-6 text-white text-center">Zone Operations Live Feed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.zones.map(z => (
                <div key={z.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-100">{z.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">{z.type}</div>
                  </div>
                  <div className={`text-xl font-black ${z.congestion === 'red' ? 'text-rose-400' : z.congestion === 'yellow' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {z.waitTime}m
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminConsole;
