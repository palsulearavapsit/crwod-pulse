const state = {
  zones: [
    { id: 'gate-n', name: 'North Gate', type: 'gate', waitTime: 5, congestion: 'low' },
    { id: 'gate-s', name: 'South Gate', type: 'gate', waitTime: 12, congestion: 'medium' },
    { id: 'gate-vip', name: 'Premium Platinum Lounge', type: 'gate', waitTime: 1, congestion: 'low', isVip: true },
    { id: 'exit-e', name: 'Rear Egress Exit', type: 'gate', waitTime: 0, congestion: 'low', isEgressOnly: true },
    { id: 'conc-1', name: 'Burger Stand 1', type: 'concession', waitTime: 25, congestion: 'red' },
    { id: 'conc-2', name: 'Drinks Stand East', type: 'concession', waitTime: 4, congestion: 'low' },
    { id: 'rest-w', name: 'West Restroom', type: 'restroom', waitTime: 8, congestion: 'medium' },
    { id: 'rest-e', name: 'East Restroom', type: 'restroom', waitTime: 2, congestion: 'low' },
    { id: 'block-101', name: 'Seating Block 101', type: 'seating', waitTime: 0, congestion: 'medium' }
  ],
  alerts: [],
  kpis: {
    averageWait: 8,
    activeAlerts: 0,
    timeSavedTotal: 1542
  },
  scenarioActive: null
};

// Simulation engine to naturally fluctuate wait times and state
setInterval(() => {
  if (state.scenarioActive) return; // Freeze natural sim if scenario is controlling heavily

  state.zones.forEach(zone => {
    // slight natural fluctuation
    const fluctuation = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
    zone.waitTime = Math.max(0, zone.waitTime + fluctuation);

    // update congestion label
    if (zone.waitTime < 7) zone.congestion = 'green';
    else if (zone.waitTime < 15) zone.congestion = 'yellow';
    else zone.congestion = 'red';
  });

  // Calculate new KPI
  const sumWeights = state.zones.filter(z => z.type !== 'seating').reduce((a, b) => a + b.waitTime, 0);
  const count = state.zones.filter(z => z.type !== 'seating').length;
  state.kpis.averageWait = Math.round(sumWeights / (count || 1));

}, 3000); // refresh every 3 seconds

module.exports = state;
