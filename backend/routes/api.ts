import express, { Request, Response, Router } from 'express';
import { Server } from 'socket.io';
import { state, updateState, VenueState, Zone } from '../data/venueState';
import { authenticate } from '../middleware/auth';
import logger from '../utils/logger';

const VALID_SCENARIOS = ['halftime', 'gate-closure', 'egress', 'reset'] as const;
type Scenario = typeof VALID_SCENARIOS[number];

/**
 * Professional API Router Factory
 * @param io Socket.io server instance for real-time broadcasts
 */
const apiRoutesFactory = (io: Server): Router => {
  const router = express.Router();

  // ── Public Endpoints ────────────────────────────────────────────────────────

  /**
   * @route GET /api/zones
   * @desc Retrieve all venue zones with status
   */
  router.get('/zones', (req: Request, res: Response) => {
    res.json(state.zones);
  });

  /**
   * @route GET /api/recommendations
   * @desc Get AI-advised routing for attendees
   */
  router.get('/recommendations', (req: Request, res: Response) => {
    const isVip = req.query.vip === 'true';
    let gates = state.zones.filter(z => z.type === 'gate' && !(z as any).isEgressOnly);
    
    if (!isVip) {
      gates = gates.filter(z => !(z as any).isVip);
    }

    const concessions = state.zones.filter(z => z.type === 'concession');
    gates.sort((a, b) => a.waitTime - b.waitTime);
    concessions.sort((a, b) => a.waitTime - b.waitTime);

    const bestGate = gates[0];
    const fastestConcession = concessions[0];

    res.json({
      bestGate,
      fastestConcession,
      lowCrowdRoute: isVip
        ? `Enter via ${bestGate?.name}, take exclusive elevator 3 to VIP lounge.`
        : `Enter via ${bestGate?.name}, bypass main concourse directly to Seating 101.`
    });
  });

  router.get('/alerts', (req: Request, res: Response) => {
    res.json(state.alerts);
  });

  // ── Admin Protected Endpoints ───────────────────────────────────────────────

  /**
   * @route POST /api/admin/scenario
   * @desc Apply a structural stadium scenario (e.g., Halftime surge)
   */
  router.post('/admin/scenario', authenticate, async (req: Request, res: Response) => {
    const { scenario } = req.body as { scenario: Scenario };

    if (!scenario || !VALID_SCENARIOS.includes(scenario)) {
      return res.status(400).json({ error: `Invalid scenario. Must be one of: ${VALID_SCENARIOS.join(', ')}` });
    }

    const zones = [...state.zones];

    if (scenario === 'halftime') {
      zones.forEach(z => {
        if (z.type === 'gate' || z.type === 'concession') z.waitTime += 15;
      });
    } else if (scenario === 'gate-closure') {
      const g = zones.find(z => z.id === 'gate-n');
      if (g) g.waitTime = 99;
    } else if (scenario === 'reset') {
      zones.forEach(z => z.waitTime = Math.floor(Math.random() * 10) + 2);
    }

    // Refresh congestion colors after state mutation
    zones.forEach(z => {
      if (z.waitTime < 7) z.congestion = 'green';
      else if (z.waitTime < 15) z.congestion = 'yellow';
      else z.congestion = 'red';
    });

    await updateState({ zones });
    io.emit('scenario:applied', { scenario, zones });
    res.json({ success: true, scenario, zones });
  });

  /**
   * @route POST /api/admin/update-zone
   * @desc Direct surgical update of a zone's metrics
   */
  router.post('/admin/update-zone', authenticate, async (req: Request, res: Response) => {
    const { id, waitTime, isClosed } = req.body;
    const zones = [...state.zones];
    const zoneIndex = zones.findIndex(z => z.id === id);

    if (zoneIndex === -1) return res.status(404).json({ error: 'Zone not found' });

    if (waitTime !== undefined) zones[zoneIndex].waitTime = Number(waitTime);
    if (isClosed !== undefined) (zones[zoneIndex] as any).isClosed = Boolean(isClosed);

    const zone = zones[zoneIndex];
    if (zone.waitTime < 7) zone.congestion = 'green';
    else if (zone.waitTime < 15) zone.congestion = 'yellow';
    else zone.congestion = 'red';

    await updateState({ zones });
    io.emit('state:update', state);
    res.json({ success: true, zone });
  });

  /**
   * @route POST /api/admin/stress-test
   * @desc Point 13: Industrial-grade synthetic data generator
   * Simulates high-velocity congestion changes for testing monitoring response.
   */
  router.post('/admin/stress-test', authenticate, (req: Request, res: Response) => {
    logger.warn('⚠️ Starting synthetic stress test simulation...');
    let cycle = 0;
    const interval = setInterval(async () => {
      const zones = state.zones.map(z => ({
        ...z,
        waitTime: Math.floor(Math.random() * 50) + 5
      }));
      await updateState({ zones });
      io.emit('state:update', state);
      cycle++;
      if (cycle >= 10) clearInterval(interval);
    }, 1000);
    res.json({ success: true, message: 'Stress test initiated. 10 state cycles running.' });
  });

  return router;
};

export default apiRoutesFactory;
