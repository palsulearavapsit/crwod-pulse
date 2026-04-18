import { db } from '../services/firebase';
import logger from '../utils/logger';

export interface Zone {
  id: string;
  name: string;
  type: 'gate' | 'concession' | 'seating';
  waitTime: number;
  congestion: 'green' | 'yellow' | 'red';
  capacity?: number;
}

export interface VenueState {
  zones: Zone[];
  alerts: any[];
  kpis: any;
}

// Initial/default state
export let state: VenueState = {
  zones: [
    { id: 'gate-n', name: 'North Gate', type: 'gate', waitTime: 2, congestion: 'green' },
    { id: 'gate-s', name: 'South Gate', type: 'gate', waitTime: 12, congestion: 'yellow' },
    { id: 'gate-e', name: 'East Gate', type: 'gate', waitTime: 4, congestion: 'green' },
    { id: 'gate-w', name: 'West Gate', type: 'gate', waitTime: 35, congestion: 'red' },
    { id: 'food-1', name: 'Pizza Hub', type: 'concession', waitTime: 8, congestion: 'yellow' },
    { id: 'food-2', name: 'Drink Station', type: 'concession', waitTime: 3, congestion: 'green' },
  ],
  alerts: [],
  kpis: {
    totalFans: 42500,
    averageWait: 8,
    activeAnomalies: 1
  }
};

/**
 * Sync logic: If Firestore is available, listen for changes.
 * This allows real-time updates from multiple admin instances or external sources.
 */
if (db) {
  const venueRef = db.collection('venues').doc('main-stadium');
  
  venueRef.onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data() as VenueState;
      state = { ...state, ...data };
      logger.info('🔄 State synced from Firestore');
    } else {
      // Initialize Firestore if empty
      venueRef.set(state);
      logger.info('📤 Initialized Firestore with default state');
    }
  }, error => {
    logger.error({ error }, '❌ Firestore Sync Error');
  });
}

/**
 * Persist state change
 */
export const updateState = async (newState: Partial<VenueState>) => {
  state = { ...state, ...newState };
  if (db) {
    try {
      await db.collection('venues').doc('main-stadium').set(state, { merge: true });
    } catch (err) {
      logger.error('Failed to persist to Firestore');
    }
  }
};
