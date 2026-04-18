import request from 'supertest';
import { app } from '../app';

process.env.NODE_ENV = 'test';

describe('AI Endpoints', () => {
  it('POST /api/ai/chat returns a reply', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'Hello' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reply');
  });

  it('POST /api/ai/deep-analysis returns analysis', async () => {
    const res = await request(app)
      .post('/api/ai/deep-analysis')
      .send({});
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('analysis');
  });
});
