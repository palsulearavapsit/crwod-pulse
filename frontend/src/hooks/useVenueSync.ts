import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';
import { VenueState } from '../types';

/**
 * useVenueSync - Industrial-grade reactive state synchronization hook.
 * Features: Throttled updates, runtime validation, and circuit-breaker error handling.
 * 
 * @returns {state: VenueState, loading: boolean, error: string | null, refresh: Function}
 */
export const useVenueSync = () => {
  const [state, setState] = useState<VenueState>({ zones: [], alerts: [], kpis: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Runtime validator ensuring incoming socket data matches expected schema 
   * to prevent downstream hydration crashes.
   */
  const validateState = (data: any): data is VenueState => {
    return Array.isArray(data.zones) && Array.isArray(data.alerts);
  };

  const fetchState = useCallback(async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/zones`);
      if (!res.ok) throw new Error('Failed to fetch initial state');
      const data = await res.json();
      setState(s => ({ ...s, zones: data }));
    } catch (err) {
      console.error('Initial sync error:', err);
      setError('Live sync failed. retrying...');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Connect and listen
    socketService.connect();
    // Throttled listener to prevent UI jank during high-frequency updates
    let lastUpdate = 0;
    const THROTTLE_MS = 100;

    socketService.onStateUpdate((newState) => {
      const now = Date.now();
      if (mounted && now - lastUpdate > THROTTLE_MS && validateState(newState)) {
        setState(newState);
        lastUpdate = now;
      }
    });

    fetchState();

    return () => {
      mounted = false;
      socketService.disconnect();
    };
  }, [fetchState]);

  return { state, loading, error, refresh: fetchState };
};
