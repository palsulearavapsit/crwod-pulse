/**
 * mockState.js — In-memory venue state with a realistic live simulation engine.
 * Mean-reverting wait time drift by zone type — simulates natural crowd behaviour.
 */

const BASE_WAIT_TIMES = {
  'gate-n':    5,
  'gate-s':    12,
  'gate-vip':  1,
  'exit-e':    0,
  'conc-1':    8,
  'conc-2':    4,
  'rest-w':    6,
  'rest-e':    2,
  'block-101': 0,
};

const state = {
  zones: [
    { id: 'gate-n',    name: 'North Gate',              type: 'gate',       waitTime: 5,  congestion: 'green' },
    { id: 'gate-s',    name: 'South Gate',              type: 'gate',       waitTime: 12, congestion: 'yellow' },
    { id: 'gate-vip',  name: 'Premium Platinum Lounge', type: 'gate',       waitTime: 1,  congestion: 'green', isVip: true },
    { id: 'exit-e',    name: 'Rear Egress Exit',        type: 'gate',       waitTime: 0,  congestion: 'green', isEgressOnly: true },
    { id: 'conc-1',    name: 'Burger Stand 1',          type: 'concession', waitTime: 8,  congestion: 'yellow' },
    { id: 'conc-2',    name: 'Drinks Stand East',       type: 'concession', waitTime: 4,  congestion: 'green' },
    { id: 'rest-w',    name: 'West Restroom',           type: 'restroom',   waitTime: 6,  congestion: 'green' },
    { id: 'rest-e',    name: 'East Restroom',           type: 'restroom',   waitTime: 2,  congestion: 'green' },
    { id: 'block-101', name: 'Seating Block 101',       type: 'seating',    waitTime: 0,  congestion: 'green' },
  ],
  alerts: [],
  kpis: {
    averageWait:    6,
    activeAlerts:   0,
    timeSavedTotal: 1542,
  },
  scenarioActive: null,
};

// ── Helper: recalculate congestion label ──────────────────────────────────────
function recalcCongestion(zone) {
  if (zone.isClosed)      return 'red';
  if (zone.waitTime < 7)  return 'green';
  if (zone.waitTime < 15) return 'yellow';
  return 'red';
}

// ── Helper: recalculate KPIs ──────────────────────────────────────────────────
function recalcKPIs() {
  const active = state.zones.filter(z => z.type !== 'seating' && !z.isClosed);
  const sum    = active.reduce((a, z) => a + z.waitTime, 0);
  state.kpis.averageWait    = Math.round(sum / (active.length || 1));
  state.kpis.timeSavedTotal += Math.floor(Math.random() * 2); // slowly grows, simulating AI savings
}

// ── Realistic simulation engine ───────────────────────────────────────────────
const DRIFT_CONFIG = {
  gate:       { volatility: 2, reversion: 0.15 },
  concession: { volatility: 3, reversion: 0.10 },
  restroom:   { volatility: 2, reversion: 0.12 },
  seating:    { volatility: 0, reversion: 0    },
};

const simInterval = setInterval(() => {
  if (state.scenarioActive && state.scenarioActive !== 'reset') return;

  state.zones.forEach(zone => {
    if (zone.isClosed) return;
    const cfg  = DRIFT_CONFIG[zone.type] || { volatility: 1, reversion: 0.1 };
    const base = BASE_WAIT_TIMES[zone.id] ?? 5;
    const noise   = (Math.random() * cfg.volatility * 2) - cfg.volatility;
    const revert  = (base - zone.waitTime) * cfg.reversion;
    zone.waitTime = Math.max(0, Math.min(60, Math.round(zone.waitTime + noise + revert)));
    zone.congestion = recalcCongestion(zone);
  });

  recalcKPIs();
}, 4000);

// Prevent the interval from keeping Node alive during tests
simInterval.unref?.();

module.exports = { state, recalcCongestion, recalcKPIs };
