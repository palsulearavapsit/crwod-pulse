const express = require('express');
const router = express.Router();
const state = require('../data/mockState');

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
    
    // Filter out egress-only gates, and handle VIP logic
    gates = gates.filter(z => !z.isEgressOnly);
    if (!isVip) {
      gates = gates.filter(z => !z.isVip); // Hide VIP gates from normal users
    }

    const concessions = state.zones.filter(z => z.type === 'concession');
    
    // sorting by lowest wait time
    gates.sort((a, b) => a.waitTime - b.waitTime);
    concessions.sort((a, b) => a.waitTime - b.waitTime);

    const bestGate = gates[0];
    const fastestConcession = concessions[0];
    
    res.json({
      bestGate,
      fastestConcession,
      lowCrowdRoute: isVip 
        ? `Enter via ${bestGate.name}, take exclusive elevator 3 to VIP lounge.`
        : `Enter via ${bestGate.name}, bypass main concourse directly to Seating 101.`
    });
  });

  // GET /api/alerts
  router.get('/alerts', (req, res) => {
    res.json(state.alerts);
  });

  // POST /api/admin/scenario
  router.post('/admin/scenario', (req, res) => {
    const { scenario } = req.body;
    state.scenarioActive = scenario;

    if (scenario === 'halftime') {
      state.zones.forEach(z => {
        if (z.type === 'restroom' || z.type === 'concession') z.waitTime += 15;
      });
    } else if (scenario === 'gate-closure') {
      const g = state.zones.find(z => z.id === 'gate-n');
      if (g) g.waitTime = 99; // Closed
    } else if (scenario === 'egress') {
      // Egress mode pushes wait times on normal exits up to simulate crush,
      // but opens Egress-only gates
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
  router.post('/admin/update-zone', (req, res) => {
    const { id, waitTime, isClosed } = req.body;
    const zone = state.zones.find(z => z.id === id);
    if (zone) {
      if (waitTime !== undefined) zone.waitTime = waitTime;
      if (isClosed !== undefined) zone.isClosed = isClosed;

      if (zone.isClosed) zone.congestion = 'red';
      else if (zone.waitTime < 7) zone.congestion = 'green';
      else if (zone.waitTime < 15) zone.congestion = 'yellow';
      else zone.congestion = 'red';
      io.emit('state:update', state);
      res.json({ success: true, zone });
    } else {
      res.status(404).json({ error: 'Zone not found' });
    }
  });

  // POST /admin/alert
  router.post('/admin/alert', (req, res) => {
    const { message, severity } = req.body;
    const newAlert = { id: Date.now(), message, severity, timestamp: new Date() };
    state.alerts.unshift(newAlert);
    if(state.alerts.length > 5) state.alerts.pop();
    state.kpis.activeAlerts = state.alerts.length;
    
    io.emit('alert:new', newAlert);
    res.json({ success: true, alert: newAlert });
  });

  // POST /api/admin/flash-sale
  router.post('/admin/flash-sale', (req, res) => {
    const concessions = state.zones.filter(z => z.type === 'concession');
    concessions.sort((a, b) => a.waitTime - b.waitTime);
    const target = concessions[0]; // best target for a sale

    const message = `FLASH SALE: 20% off all items at ${target.name} for the next 10 minutes! No line right now.`;
    const newAlert = { id: Date.now(), message, severity: 'promo', timestamp: new Date() };
    
    state.alerts.unshift(newAlert);
    if(state.alerts.length > 5) state.alerts.pop();
    state.kpis.activeAlerts = state.alerts.length;
    
    io.emit('alert:new', newAlert);
    res.json({ success: true, alert: newAlert, targetZone: target });
  });

  // return the router
  return router;
};
