import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Navigation, Clock, MessageSquare, Mic, Shield } from 'lucide-react';
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';

import { socketService } from '../services/socket';
import { VenueState, Zone } from '../types';
import StatCard from '../components/atoms/StatCard';
import LanguageSwitcher from '../components/molecules/LanguageSwitcher';
import ZoneList from '../components/organisms/ZoneList';

// Google Maps Config - Added safe fallback for production stability
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''; 
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };
const MAP_CENTER = { lat: 23.0927, lng: 72.5976 };

const AttendeeDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<VenueState>({ zones: [], alerts: [], kpis: {} });
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

  useEffect(() => {
    const socket = socketService.connect();
    socketService.onStateUpdate((newState) => setState(newState));
    return () => socketService.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-header border-b border-slate-800/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Shield className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 brand-header">
              {t('brand_name', 'CrowdPulse')}
            </h1>
            <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest leading-none">
              {t('venue_intelligence', 'Venue Intelligence')}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title={t('wait_time')} 
            value={`${state.kpis.averageWait || 0}m`} 
            icon={<Clock size={14} />} 
          />
          <StatCard 
            title="Active Fans" 
            value={state.kpis.totalFans?.toLocaleString() || '0'} 
            highlight 
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-xl border border-slate-800 w-fit">
          <button 
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'map' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Map View
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'list' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            List View
          </button>
        </div>

        {activeTab === 'map' ? (
          <div className="rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl h-[500px]">
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={MAP_CENTER}
                zoom={15}
                options={{ disableDefaultUI: true }}
              >
                {state.zones.map(z => {
                  const offset = (parseInt(z.id.slice(-1), 36) || 0) * 0.001;
                  const color = z.congestion === 'red' ? '#f43f5e' : z.congestion === 'yellow' ? '#f59e0b' : '#10b981';
                  return (
                    <Circle
                      key={z.id}
                      center={{ lat: MAP_CENTER.lat + offset - 0.005, lng: MAP_CENTER.lng + offset }}
                      radius={60 + z.waitTime * 2}
                      options={{ strokeColor: color, strokeOpacity: 0.8, fillOpacity: 0.35, fillColor: color }}
                    />
                  );
                })}
              </GoogleMap>
            </LoadScript>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl overflow-hidden">
             <ZoneList zones={state.zones} />
          </div>
        )}
      </main>

      {/* Floating Action Bar */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <div className="glass-panel p-2 rounded-2xl flex items-center justify-around shadow-2xl border border-white/10">
          <button className="flex flex-col items-center gap-1 p-2 text-brand-400">
             <Navigation size={20} />
             <span className="text-[10px] font-bold">Path</span>
          </button>
          <button className="w-14 h-14 bg-brand-600 rounded-full flex items-center justify-center -translate-y-4 shadow-xl shadow-brand-500/40 border-4 border-slate-950">
             <MessageSquare className="text-white" />
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-slate-500">
             <Mic size={20} />
             <span className="text-[10px] font-bold">Assist</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AttendeeDashboard;
