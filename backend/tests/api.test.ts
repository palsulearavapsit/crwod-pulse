import request from 'supertest';
import { app } from '../app';

// Ensure test environment
process.env.ADMIN_SECRET = 'test-admin-token';
process.env.NODE_ENV = 'test';

const ADMIN_HEADERS = {
  'Authorization': 'Bearer test-admin-token',
  'Content-Type': 'application/json',
};

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/zones', () => {
  it('returns an array of zones', async () => {
    const res = await request(app).get('/api/zones');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/admin/scenario', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/admin/scenario')
      .send({ scenario: 'reset' });
    expect(res.status).toBe(401);
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

describe('POST /api/admin/update-zone', () => {
  it('updates a zone wait time successfully', async () => {
    const res = await request(app)
      .post('/api/admin/update-zone')
      .set(ADMIN_HEADERS)
      .send({ id: 'gate-n', waitTime: 10 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.zone.waitTime).toBe(10);
  });
});
