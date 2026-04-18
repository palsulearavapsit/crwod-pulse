import React from 'react';
import * as ReactWindow from 'react-window';
import { Zone } from '../../types';
import { MapPin, Clock } from 'lucide-react';

// @ts-ignore
const { FixedSizeList: List } = ReactWindow;

interface ZoneListProps {
  zones: Zone[];
}

const CONGESTION_LABEL: Record<string, string> = { green: 'Clear', yellow: 'Moderate', red: 'Heavily Congested' };
const CONGESTION_COLOR: Record<string, string> = { green: 'text-brand-400', yellow: 'text-amber-400', red: 'text-rose-400' };

const ZoneList: React.FC<ZoneListProps> = ({ zones }) => {
  const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const z = zones[index];
    return (
      <div style={style} className="px-5 py-2">
        <div className="glass-panel-light p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-slate-400" />
            <div>
              <div className="text-sm font-bold text-slate-100">{z.name}</div>
              <div className={`text-[10px] font-black uppercase tracking-tighter ${CONGESTION_COLOR[z.congestion]}`}>
                 {CONGESTION_LABEL[z.congestion]}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-slate-200 font-black">
              <Clock size={14} className="text-slate-500" />
              {z.waitTime}m
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <List
      height={400}
      itemCount={zones.length}
      itemSize={85}
      width="100%"
    >
      {Row}
    </List>
  );
};

export default React.memo(ZoneList);
