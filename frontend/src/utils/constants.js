/**
 * constants.js — Shared application constants.
 * Avoids magic strings scattered across the codebase.
 */

export const ROLES = {
  ADMIN:    'admin',
  ATTENDEE: 'attendee',
};

export const SCENARIOS = {
  HALFTIME:     'halftime',
  GATE_CLOSURE: 'gate-closure',
  EGRESS:       'egress',
  RESET:        'reset',
};

export const CONGESTION = {
  GREEN:  'green',
  YELLOW: 'yellow',
  RED:    'red',
};

export const CONGESTION_LABEL = {
  [CONGESTION.GREEN]:  'Low',
  [CONGESTION.YELLOW]: 'Moderate',
  [CONGESTION.RED]:    'High',
};

export const CONGESTION_COLOR = {
  [CONGESTION.GREEN]:  'text-emerald-400',
  [CONGESTION.YELLOW]: 'text-amber-400',
  [CONGESTION.RED]:    'text-rose-400',
};

export const CONGESTION_BG = {
  [CONGESTION.GREEN]:  'border-emerald-500/30 bg-emerald-950/20',
  [CONGESTION.YELLOW]: 'border-amber-400/30 bg-amber-950/20',
  [CONGESTION.RED]:    'border-rose-500/30 bg-rose-950/20',
};

export const HARDCODED_USERS = [
  { username: 'admin', password: 'admin123', role: ROLES.ADMIN },
  { username: 'arav',  password: 'arav',     role: ROLES.ATTENDEE },
  { username: 'harsh', password: 'harsh',    role: ROLES.ATTENDEE },
];

export const SUPPORTED_LANGS = [
  { code: 'es', label: '🇪🇸 ES' },
  { code: 'fr', label: '🇫🇷 FR' },
  { code: 'hi', label: '🇮🇳 HI' },
];

export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const ADMIN_TOKEN = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_SECRET) || 'crowdpulse-admin-2024';
