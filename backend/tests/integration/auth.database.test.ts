import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = testDatabaseUrl ? describe : describe.skip;

describeDatabase('authentication and ownership integration', () => {
  let app: Awaited<ReturnType<typeof import('../../src/app.js')['createApp']>>;
  let prisma: typeof import('../../src/database/prisma.js')['prisma'];

  beforeAll(async () => {
    process.env.DATABASE_URL = testDatabaseUrl!;
    process.env.JWT_ACCESS_SECRET = 'a-very-long-test-access-secret-that-is-safe';
    process.env.JWT_REFRESH_SECRET = 'a-very-long-test-refresh-secret-that-is-safe';
    process.env.NODE_ENV = 'test';
    ({ prisma } = await import('../../src/database/prisma.js'));
    const { createApp } = await import('../../src/app.js');
    app = createApp();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE');
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it('registers, authenticates and reads the current profile', async () => {
    const registration = await request(app).post('/api/v1/auth/register').send({ name: 'Ana Productora', email: 'ana@example.test', password: 'SecurePass123!' });
    expect(registration.status).toBe(201);
    expect(registration.body.data.user).toMatchObject({ email: 'ana@example.test', role: 'PRODUCER' });
    expect(registration.body.data.user.passwordHash).toBeUndefined();

    const login = await request(app).post('/api/v1/auth/login').send({ email: 'ana@example.test', password: 'SecurePass123!' });
    expect(login.status).toBe(200);
    const profile = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${login.body.data.tokens.accessToken}`);
    expect(profile.status).toBe(200);
    expect(profile.body.data).toMatchObject({ email: 'ana@example.test' });
  });

  it('does not allow a producer to list another producer farms', async () => {
    const first = await request(app).post('/api/v1/auth/register').send({ name: 'Primer productor', email: 'first@example.test', password: 'SecurePass123!' });
    const second = await request(app).post('/api/v1/auth/register').send({ name: 'Segundo productor', email: 'second@example.test', password: 'SecurePass123!' });
    const firstToken = first.body.data.tokens.accessToken;
    const secondToken = second.body.data.tokens.accessToken;
    await request(app).post('/api/v1/farms').set('Authorization', `Bearer ${firstToken}`).send({ name: 'Finca privada', province: 'Manabí', canton: 'Chone' }).expect(201);
    const farms = await request(app).get('/api/v1/farms').set('Authorization', `Bearer ${secondToken}`);
    expect(farms.status).toBe(200);
    expect(farms.body.data).toEqual([]);
  });
});
