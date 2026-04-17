/**
 * ai.test.js — Backend integration tests for AI routes.
 * Uses mock Gemini fallbacks (GEMINI_API_KEY is empty in test env).
 */
const request = require('supertest');

process.env.ADMIN_SECRET   = 'test-admin-token';
process.env.GEMINI_API_KEY = '';
process.env.NODE_ENV       = 'test';

const { app } = require('../app');

const ADMIN_HEADERS = {
  'Authorization': 'Bearer test-admin-token',
  'Content-Type':  'application/json',
};

// ── Chat ──────────────────────────────────────────────────────────────────────
describe('POST /api/ai/chat', () => {
  it('returns 200 with a reply field', async () => {
    const res = await request(app).post('/api/ai/chat').send({ message: 'Where is gate A?' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reply');
    expect(typeof res.body.reply).toBe('string');
    expect(res.body.reply.length).toBeGreaterThan(5);
  });

  it('returns 400 when message is empty', async () => {
    const res = await request(app).post('/api/ai/chat').send({});
    expect(res.status).toBe(400);
  });

  it('handles lost/bag query with contextual response', async () => {
    const res = await request(app).post('/api/ai/chat').send({ message: 'I lost my bag' });
    expect(res.status).toBe(200);
    expect(res.body.reply).toBeTruthy();
  });
});

// ── Alert Generate ─────────────────────────────────────────────────────────────
describe('POST /api/ai/alert-generate', () => {
  it('returns a generated alert text', async () => {
    const res = await request(app).post('/api/ai/alert-generate').send({ rawText: 'gate 1 is blocked' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('text');
    expect(res.body.text.length).toBeGreaterThan(5);
  });

  it('returns 400 when rawText is missing', async () => {
    const res = await request(app).post('/api/ai/alert-generate').send({});
    expect(res.status).toBe(400);
  });
});

// ── Ops Summary ────────────────────────────────────────────────────────────────
describe('POST /api/ai/ops-summary', () => {
  it('returns operational summary', async () => {
    const res = await request(app).post('/api/ai/ops-summary').send({});
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('summary');
    expect(res.body.summary.length).toBeGreaterThan(10);
  });
});

// ── Translate ─────────────────────────────────────────────────────────────────
describe('POST /api/ai/translate', () => {
  it('translates text to Spanish', async () => {
    const res = await request(app).post('/api/ai/translate').send({ text: 'Gate is closed', targetLang: 'es' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('translation');
  });

  it('returns 400 when text or targetLang is missing', async () => {
    const res = await request(app).post('/api/ai/translate').send({ text: 'hello' });
    expect(res.status).toBe(400);
  });
});

// ── Emergency Guide ────────────────────────────────────────────────────────────
describe('POST /api/ai/emergency-guide', () => {
  it('returns evacuation instructions', async () => {
    const res = await request(app).post('/api/ai/emergency-guide').send({ zone: 'Section 102' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('instructions');
    expect(res.body.instructions.length).toBeGreaterThan(10);
  });
});

// ── Anomaly Detection ──────────────────────────────────────────────────────────
describe('POST /api/ai/anomaly-detect', () => {
  it('returns anomaly description', async () => {
    const res = await request(app).post('/api/ai/anomaly-detect').send({});
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('anomaly');
  });
});

// ── Journey Plan ───────────────────────────────────────────────────────────────
describe('POST /api/ai/journey-plan', () => {
  it('returns route and ETA', async () => {
    const res = await request(app).post('/api/ai/journey-plan').send({ userLocation: 'main gate', targetSeat: '102A' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('route');
    expect(res.body).toHaveProperty('eta');
    expect(res.body).toHaveProperty('description');
  });
});

// ── Incident Triage ────────────────────────────────────────────────────────────
describe('POST /api/ai/incident-triage', () => {
  it('returns triage guide', async () => {
    const res = await request(app).post('/api/ai/incident-triage').send({ description: 'Person not feeling well near gate B' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('guide');
  });
});
