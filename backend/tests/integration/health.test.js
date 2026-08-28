import { jest, describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';

process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.NODE_ENV = 'test';

jest.unstable_mockModule('../../src/config/db.js', () => ({
  dbState: jest.fn(() => 0),
  connectDB: jest.fn(),
}));

let app;

beforeAll(async () => {
  const { createApp } = await import('../../src/app.js');
  app = createApp();
});

describe('GET /health', () => {
  test('reports degraded status when MongoDB is disconnected', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.mongo).toBe('disconnected');
  });
});
