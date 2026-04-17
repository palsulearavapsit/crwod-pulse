/**
 * mockState.test.js — Unit tests for simulation engine and state helpers.
 */
const { state, recalcCongestion } = require('../data/mockState');

describe('recalcCongestion', () => {
  it('returns green for waitTime < 7', () => {
    expect(recalcCongestion({ waitTime: 0,  isClosed: false })).toBe('green');
    expect(recalcCongestion({ waitTime: 6,  isClosed: false })).toBe('green');
  });

  it('returns yellow for waitTime 7–14', () => {
    expect(recalcCongestion({ waitTime: 7,  isClosed: false })).toBe('yellow');
    expect(recalcCongestion({ waitTime: 14, isClosed: false })).toBe('yellow');
  });

  it('returns red for waitTime >= 15', () => {
    expect(recalcCongestion({ waitTime: 15, isClosed: false })).toBe('red');
    expect(recalcCongestion({ waitTime: 99, isClosed: false })).toBe('red');
  });

  it('returns red if zone is closed regardless of waitTime', () => {
    expect(recalcCongestion({ waitTime: 0, isClosed: true })).toBe('red');
    expect(recalcCongestion({ waitTime: 5, isClosed: true })).toBe('red');
  });
});

describe('state structure', () => {
  it('has zones array', () => {
    expect(Array.isArray(state.zones)).toBe(true);
    expect(state.zones.length).toBeGreaterThan(0);
  });

  it('has kpis with required fields', () => {
    expect(state.kpis).toHaveProperty('averageWait');
    expect(state.kpis).toHaveProperty('activeAlerts');
    expect(state.kpis).toHaveProperty('timeSavedTotal');
  });

  it('each zone has required fields', () => {
    state.zones.forEach(zone => {
      expect(zone).toHaveProperty('id');
      expect(zone).toHaveProperty('name');
      expect(zone).toHaveProperty('type');
      expect(zone).toHaveProperty('waitTime');
      expect(zone).toHaveProperty('congestion');
    });
  });

  it('waitTime is non-negative for all zones', () => {
    state.zones.forEach(zone => {
      expect(zone.waitTime).toBeGreaterThanOrEqual(0);
    });
  });
});
