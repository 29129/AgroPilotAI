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
});
