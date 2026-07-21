import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

let app: Awaited<ReturnType<typeof import('../src/app.js')['createApp']>>;

beforeAll(async () => {
  process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/agropilot';
  process.env.JWT_ACCESS_SECRET = 'a-very-long-test-access-secret-that-is-safe';
  process.env.JWT_REFRESH_SECRET = 'a-very-long-test-refresh-secret-that-is-safe';
  const { createApp } = await import('../src/app.js');
  app = createApp();
});

describe('HTTP API foundation', () => {
  it('returns the standard successful envelope', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, data: { status: 'ok' } });
    expect(response.body.meta.requestId).toMatch(/^[\da-f-]{36}$/i);
  });

  it('returns the standard error envelope for unknown routes', async () => {
    const response = await request(app).get('/api/v1/unknown');
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, error: { code: 'ROUTE_NOT_FOUND' } });
    expect(response.body.meta.requestId).toMatch(/^[\da-f-]{36}$/i);
  });

  it('protects agricultural resources before accessing storage', async () => {
    const response = await request(app).get('/api/v1/farms');
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false, error: { code: 'UNAUTHORIZED' } });
  });

  it('protects diagnosis uploads before accepting a file', async () => {
    const response = await request(app).post('/api/v1/crops/1d000000-0000-4000-8000-000000000001/diagnoses');
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false, error: { code: 'UNAUTHORIZED' } });
  });

  it('protects multi-agent analysis', async () => {
    const response = await request(app).post('/api/v1/crops/1d000000-0000-4000-8000-000000000001/analysis').send({ analysisType: 'FULL' });
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false, error: { code: 'UNAUTHORIZED' } });
  });
});
