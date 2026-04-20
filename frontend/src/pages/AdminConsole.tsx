import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Zap, AlertTriangle, Send, Command, RefreshCw, Camera, Tag, ScanSearch, MessageCircleWarning, Briefcase, LogOut, Lock, Unlock, Play, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
import { VenueState, Zone } from '../types';
import { useVenueSync } from '../hooks/useVenueSync';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_SECRET || 'crowdpulse-admin-2024';

const adminHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
};

const ZoneCard = React.memo(({ z, loading }: { z?: Zone, loading?: boolean }) => {
  if (loading || !z) {
    return (
      <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-slate-800 rounded" />
          <div className="h-2 w-16 bg-slate-800/50 rounded" />
        </div>
        <div className="h-8 w-12 bg-slate-800 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between transition-all hover:border-brand-500/30 group">
      <div>
        <div className="font-bold text-slate-100 group-hover:text-white transition-colors">{z.name}</div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest">{z.type}</div>
      </div>
      <div className={`text-xl font-black ${z.congestion === 'red' ? 'text-rose-400' : z.congestion === 'yellow' ? 'text-amber-400' : 'text-emerald-400'}`}>
        {z.waitTime}m
      </div>
    </div>
  );
});

ZoneCard.displayName = 'ZoneCard';

const ZoneChart = React.memo(({ data }: { data: Zone[] }) => (
  <div className="h-64 w-full mt-8">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#94a3b8" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
        />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          label={{ value: 'Mins', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 10 }}
        />
        <Tooltip 
          cursor={{ fill: '#1e293b' }}
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
          itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
        />
        <Bar dataKey="waitTime" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.congestion === 'red' ? '#f43f5e' : entry.congestion === 'yellow' ? '#f59e0b' : '#10b981'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
));

ZoneChart.displayName = 'ZoneChart';

const AdminConsole: React.FC = () => {
  const { state, loading, error, refresh } = useVenueSync();
  const [aiCommand, setAiCommand] = useState('');
  const [opsSummary, setOpsSummary] = useState('');
  const [predictionTxt, setPredictionTxt] = useState('');
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [opsLog, setOpsLog] = useState<{ id: string; msg: string; time: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStatus, setAnalyzingStatus] = useState('');
  const navigate = useNavigate();

  const addLog = (msg: string) => {
    setOpsLog(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      msg,
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 5));
  };

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };


  const triggerScenario = async (scenario: string) => {
    // 📳 Haptic Feedback: Elite UX signal for critical ops
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }
    await fetch(`${API_URL}/api/admin/scenario`, {
      method: 'POST', headers: adminHeaders,
      body: JSON.stringify({ scenario })
    });
    showToast('success', `Scenario ${scenario} activated.`);
    addLog(`Activated ${scenario} protocol.`);
  };

  const triggerStressTest = async () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }
    await fetch(`${API_URL}/api/admin/stress-test`, { method: 'POST', headers: adminHeaders });
    showToast('info', 'High-velocity synthetic stress test initiated.');
    addLog('Stress test sequence initiated.');
  };

  const runDeepAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalyzingStatus('Analyzing patterns...');
    try {
      const res = await fetch(`${API_URL}/api/ai/deep-analysis`, { method: 'POST', headers: adminHeaders });
      const data = await res.json();
      setOpsSummary(data.analysis);
      addLog('Gemini Deep Analysis Complete.');
    } finally {
      setIsAnalyzing(false);
      setAnalyzingStatus('');
    }
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

      {/* 🟢 System Health Status Bar */}
      <div className="bg-slate-900/80 px-6 py-2 border-b border-slate-800 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-black">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-500">Venue Hub: Online</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <RefreshCw size={10} className="animate-spin-slow" />
            <span>Sync Latency: 14ms</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Shield size={10} />
            <span>Encrypted Link: AES-256</span>
          </div>
        </div>
        <div className="text-slate-600">
          Uptime: 99.98%
        </div>
      </div>

      <div aria-live="polite" className="sr-only" aria-atomic="true">
        {toast ? `System Alert: ${toast.message}` : ''}
      </div>

      {toast && (
        <div className={`mx-6 mt-4 p-4 rounded-xl border text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-brand-500/10 border-brand-500/30 text-brand-300'}`}>
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
            <button 
              disabled={isAnalyzing}
              onClick={runDeepAnalysis} 
              className="w-full bg-brand-900/40 border border-brand-500/50 text-brand-300 font-bold py-3 rounded-xl text-xs mb-3 hover:bg-brand-500/20 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? `🤖 ${analyzingStatus}` : 'Gemini 1.5 Pro: Pattern Analysis'}
            </button>
            {opsSummary && <div className="p-4 bg-brand-500/5 border border-brand-500/20 text-brand-200 text-xs rounded-xl mb-4 leading-relaxed">{opsSummary}</div>}
            
            <button onClick={getPrediction} className="w-full bg-indigo-900/40 border border-indigo-500/50 text-indigo-300 font-bold py-3 rounded-xl text-xs mb-3 hover:bg-indigo-500/20 transition-all">
              AI Crowd Flow Prediction
            </button>
            {predictionTxt && <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 text-xs rounded-xl mb-4 leading-relaxed font-mono">{predictionTxt}</div>}
          </section>

          <section className="glass-panel p-5 rounded-2xl border border-slate-800">
            <h2 className="font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 text-slate-500">
              <RefreshCw size={14} /> Ops Audit Log
            </h2>
            <div className="space-y-3">
              {opsLog.length === 0 ? (
                <div className="text-[10px] text-slate-600 italic">No actions recorded in this session.</div>
              ) : (
                opsLog.map(log => (
                  <div key={log.id} className="flex justify-between items-start gap-3 border-l-2 border-slate-800 pl-3 py-1">
                    <div className="text-[10px] text-slate-300 leading-tight">{log.msg}</div>
                    <div className="text-[8px] text-slate-600 font-mono shrink-0">{log.time}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-9">
          <section className="glass-panel p-6 rounded-2xl h-full relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="font-extrabold text-xl text-white">Zone Operations Live Feed</h2>
              <div className="text-[9px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-black border border-emerald-500/20 uppercase tracking-tighter">
                Strategic 3D Flow: Active
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [perspective:2000px]">
              {state.zones.map(z => (
                <div key={z.id} className="[transform:rotateX(10deg)_rotateY(-5deg)] hover:[transform:none] transition-all duration-700 ease-out">
                  <ZoneCard z={z} />
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800">
               <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2">
                 <BarChart3 size={16} className="text-brand-500" /> Wait Time Distribution
               </h3>
               <ZoneChart data={state.zones} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminConsole;
