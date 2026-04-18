// Backend auth middleware — checks for admin token on protected routes
const ADMIN_TOKEN = process.env.ADMIN_SECRET || 'crowdpulse-admin-2024';

/**
 * Middleware: verify admin requests carry the correct token.
 * Frontend must send: Authorization: Bearer <token>
 */
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: Admin access required.' });
  }
  next();
}

/**
 * Validate & sanitize numeric fields from request body.
 */
function parsePositiveInt(val, max = 999) {
  const n = parseInt(val, 10);
  if (isNaN(n) || n < 0) return null;
  return Math.min(n, max);
}

const express = require('express');
const router  = require('express').Router();
const { state, recalcCongestion } = require('../data/mockState');

const VALID_SCENARIOS = ['halftime', 'gate-closure', 'egress', 'reset'];

module.exports = (io) => {
  // GET /api/zones
  router.get('/zones', (req, res) => {
    res.json(state.zones);
  });

  // GET /api/queues
  router.get('/queues', (req, res) => {
    const queues = state.zones.filter(z => z.type !== 'seating');
    res.json(queues);
  });

  // GET /api/recommendations
  router.get('/recommendations', (req, res) => {
    const isVip = req.query.vip === 'true';
    let gates = state.zones.filter(z => z.type === 'gate');

    gates = gates.filter(z => !z.isEgressOnly);
    if (!isVip) {
      gates = gates.filter(z => !z.isVip);
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

  // GET /api/alerts
  router.get('/alerts', (req, res) => {
    res.json(state.alerts);
  });

  // ── Admin Routes (require token) ────────────────────────────────────────────

  // POST /api/admin/scenario
  router.post('/admin/scenario', requireAdmin, (req, res) => {
    const { scenario } = req.body;

    if (!scenario || !VALID_SCENARIOS.includes(scenario)) {
      return res.status(400).json({ error: `Invalid scenario. Must be one of: ${VALID_SCENARIOS.join(', ')}` });
    }

    state.scenarioActive = scenario;

    if (scenario === 'halftime') {
      state.zones.forEach(z => {
        if (z.type === 'restroom' || z.type === 'concession') z.waitTime += 15;
      });
    } else if (scenario === 'gate-closure') {
      const g = state.zones.find(z => z.id === 'gate-n');
      if (g) g.waitTime = 99;
    } else if (scenario === 'egress') {
      state.zones.forEach(z => {
        if (z.type === 'gate' && !z.isEgressOnly) z.waitTime += 20;
        if (z.isEgressOnly) z.waitTime = 1;
      });
    } else if (scenario === 'reset') {
      state.scenarioActive = null;
      state.zones.forEach(z => z.waitTime = Math.floor(Math.random() * 10) + 2);
    }

    state.zones.forEach(zone => {
      if (zone.waitTime < 7) zone.congestion = 'green';
      else if (zone.waitTime < 15) zone.congestion = 'yellow';
      else zone.congestion = 'red';
    });

    io.emit('scenario:applied', { scenario, zones: state.zones });
    res.json({ success: true, scenario, zones: state.zones });
  });

  // POST /api/admin/update-zone
  router.post('/admin/update-zone', requireAdmin, (req, res) => {
    const { id, waitTime, isClosed } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Zone id is required.' });
    }

    const zone = state.zones.find(z => z.id === id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found.' });
    }

    if (waitTime !== undefined) {
      const parsed = parsePositiveInt(waitTime, 120);
      if (parsed === null) return res.status(400).json({ error: 'waitTime must be a non-negative integer.' });
      zone.waitTime = parsed;
    }
    if (isClosed !== undefined) zone.isClosed = Boolean(isClosed);

    if (zone.isClosed) zone.congestion = 'red';
    else if (zone.waitTime < 7) zone.congestion = 'green';
    else if (zone.waitTime < 15) zone.congestion = 'yellow';
    else zone.congestion = 'red';

    if (req.app.get('triggerUpdate')) {
      req.app.get('triggerUpdate')();
    } else {
      io.emit('state:update', state);
    }
    res.json({ success: true, zone });
  });

  // POST /api/admin/alert
  router.post('/admin/alert', requireAdmin, (req, res) => {
    const { message, severity } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Alert message cannot be empty.' });
    }
    const allowedSeverities = ['low', 'medium', 'high', 'promo'];
    const safeSeverity = allowedSeverities.includes(severity) ? severity : 'high';

    const newAlert = {
      id: Date.now(),
      message: message.trim().slice(0, 500), // cap length
      severity: safeSeverity,
      timestamp: new Date()
    };
    state.alerts.unshift(newAlert);
    if (state.alerts.length > 5) state.alerts.pop();
    state.kpis.activeAlerts = state.alerts.length;

    io.emit('alert:new', newAlert);
    res.json({ success: true, alert: newAlert });
  });

  // POST /api/admin/flash-sale
  router.post('/admin/flash-sale', requireAdmin, (req, res) => {
    const concessions = state.zones.filter(z => z.type === 'concession');
    concessions.sort((a, b) => a.waitTime - b.waitTime);
    const target = concessions[0];

    if (!target) return res.status(404).json({ error: 'No concession zones found.' });

    const message = `FLASH SALE: 20% off all items at ${target.name} for the next 10 minutes! No line right now.`;
    const newAlert = { id: Date.now(), message, severity: 'promo', timestamp: new Date() };

    state.alerts.unshift(newAlert);
    if (state.alerts.length > 5) state.alerts.pop();
    state.kpis.activeAlerts = state.alerts.length;

    io.emit('alert:new', newAlert);
    res.json({ success: true, alert: newAlert, targetZone: target });
  });

  return router;
};
