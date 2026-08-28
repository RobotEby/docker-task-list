import { jest, describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';

process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.NODE_ENV = 'test';

const mockUserModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
};

jest.unstable_mockModule('../../src/models/User.js', () => ({
  User: mockUserModel,
}));

let createApp;
let app;

beforeAll(async () => {
  ({ createApp } = await import('../../src/app.js'));
  app = createApp();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /auth/register', () => {
  test('rejects short password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'user@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/8 caracteres/);
  });

  test('rejects duplicate email', async () => {
    mockUserModel.findOne.mockResolvedValueOnce({ _id: '1', email: 'user@example.com' });

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'user@example.com', password: 'supersecret' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/já registrado/);
  });

  test('creates a user and returns a token', async () => {
    mockUserModel.findOne.mockResolvedValueOnce(null);
    mockUserModel.create.mockResolvedValueOnce({
      _id: 'abc123',
      email: 'user@example.com',
    });

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'user@example.com', password: 'supersecret' });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({ id: 'abc123', email: 'user@example.com' });
  });
});

describe('POST /auth/login', () => {
  test('rejects unknown email', async () => {
    mockUserModel.findOne.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Credenciais inválidas/);
  });

  test('logs in successfully with correct credentials', async () => {
    const passwordHash = await bcrypt.hash('supersecret', 10);
    mockUserModel.findOne.mockResolvedValueOnce({
      _id: 'abc123',
      email: 'user@example.com',
      password: passwordHash,
    });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'supersecret' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });
});

describe('GET /auth/me', () => {
  test('rejects requests without a token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });
});
