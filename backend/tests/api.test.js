/**
 * api.test.js — Backend integration tests using Supertest.
 *
 * Tests all major API routes:
 *  - GET  /api/zones
 *  - GET  /api/recommendations
 *  - GET  /api/alerts
 *  - GET  /health
 *  - POST /api/admin/scenario (auth required)
 *  - POST /api/admin/update-zone (auth required)
 *  - POST /api/admin/alert (auth required)
 * 
 * Run: npm test (uses Jest)
 */
const request = require('supertest');

// Set environment before importing app
process.env.ADMIN_SECRET   = 'test-admin-token';
process.env.GEMINI_API_KEY = ''; // force mock fallback in tests
process.env.NODE_ENV       = 'test';

const { app } = require('../app');

const ADMIN_HEADERS = {
  'Authorization': 'Bearer test-admin-token',
  'Content-Type': 'application/json',
};

// ── Health ────────────────────────────────────────────────────────────────────
describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

// ── Zones ─────────────────────────────────────────────────────────────────────
describe('GET /api/zones', () => {
  it('returns an array of zones', async () => {
    const res = await request(app).get('/api/zones');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('each zone has required fields', async () => {
    const res = await request(app).get('/api/zones');
    res.body.forEach(zone => {
      expect(zone).toHaveProperty('id');
      expect(zone).toHaveProperty('name');
      expect(zone).toHaveProperty('type');
      expect(zone).toHaveProperty('waitTime');
      expect(zone).toHaveProperty('congestion');
    });
  });
});

// ── Recommendations ───────────────────────────────────────────────────────────
describe('GET /api/recommendations', () => {
  it('returns recommendations with bestGate and fastestConcession', async () => {
    const res = await request(app).get('/api/recommendations');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('bestGate');
    expect(res.body).toHaveProperty('fastestConcession');
    expect(res.body).toHaveProperty('lowCrowdRoute');
  });

  it('hides VIP gates for non-VIP users', async () => {
    const res = await request(app).get('/api/recommendations?vip=false');
    expect(res.status).toBe(200);
    // bestGate should not be the VIP gate
    if (res.body.bestGate) {
      expect(res.body.bestGate.isVip).toBeFalsy();
    }
  });

  it('includes VIP route text for VIP users', async () => {
    const res = await request(app).get('/api/recommendations?vip=true');
    expect(res.status).toBe(200);
    if (res.body.lowCrowdRoute) {
      expect(typeof res.body.lowCrowdRoute).toBe('string');
    }
  });
});

// ── Alerts ────────────────────────────────────────────────────────────────────
describe('GET /api/alerts', () => {
  it('returns an array (empty or not)', async () => {
    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ── Admin: Scenario ───────────────────────────────────────────────────────────
describe('POST /api/admin/scenario', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/admin/scenario')
      .send({ scenario: 'reset' });
    expect(res.status).toBe(401);
  });

  it('rejects invalid scenario names', async () => {
    const res = await request(app)
      .post('/api/admin/scenario')
      .set(ADMIN_HEADERS)
      .send({ scenario: 'invalid-scenario' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('accepts valid scenario: halftime', async () => {
    const res = await request(app)
      .post('/api/admin/scenario')
      .set(ADMIN_HEADERS)
      .send({ scenario: 'halftime' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.scenario).toBe('halftime');
  });

  it('accepts valid scenario: reset', async () => {
    const res = await request(app)
      .post('/api/admin/scenario')
      .set(ADMIN_HEADERS)
      .send({ scenario: 'reset' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ── Admin: Update Zone ─────────────────────────────────────────────────────────
describe('POST /api/admin/update-zone', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/admin/update-zone')
      .send({ id: 'gate-n', waitTime: 5 });
    expect(res.status).toBe(401);
  });

  it('returns 404 for unknown zone id', async () => {
    const res = await request(app)
      .post('/api/admin/update-zone')
      .set(ADMIN_HEADERS)
      .send({ id: 'zone-nonexistent', waitTime: 5 });
    expect(res.status).toBe(404);
  });

  it('updates a zone wait time successfully', async () => {
    const res = await request(app)
      .post('/api/admin/update-zone')
      .set(ADMIN_HEADERS)
      .send({ id: 'gate-n', waitTime: 10 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.zone.waitTime).toBe(10);
  });

  it('rejects negative wait times', async () => {
    const res = await request(app)
      .post('/api/admin/update-zone')
      .set(ADMIN_HEADERS)
      .send({ id: 'gate-n', waitTime: -5 });
    expect(res.status).toBe(400);
  });
});

// ── Admin: Alert ──────────────────────────────────────────────────────────────
describe('POST /api/admin/alert', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/admin/alert')
      .send({ message: 'Test alert', severity: 'high' });
    expect(res.status).toBe(401);
  });

  it('rejects empty message', async () => {
    const res = await request(app)
      .post('/api/admin/alert')
      .set(ADMIN_HEADERS)
      .send({ message: '', severity: 'high' });
    expect(res.status).toBe(400);
  });

  it('broadcasts a valid alert', async () => {
    const res = await request(app)
      .post('/api/admin/alert')
      .set(ADMIN_HEADERS)
      .send({ message: 'North gate is now open', severity: 'high' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.alert.message).toBe('North gate is now open');
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
  it('returns 404 for unknown endpoints', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
  });
});
