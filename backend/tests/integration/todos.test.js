import { jest, describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.NODE_ENV = 'test';

const mockUserModel = {
  findById: jest.fn(),
};

const mockTodoModel = {
  find: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  bulkWrite: jest.fn(),
};

jest.unstable_mockModule('../../src/models/User.js', () => ({ User: mockUserModel }));
jest.unstable_mockModule('../../src/models/Todo.js', () => ({ Todo: mockTodoModel }));

let app;
let authToken;
const userId = '507f1f77bcf86cd799439011';

beforeAll(async () => {
  const { createApp } = await import('../../src/app.js');
  app = createApp();
  authToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUserModel.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue({ _id: userId, email: 'user@example.com' }),
  });
});

describe('auth guard', () => {
  test('rejects requests without a bearer token', async () => {
    const res = await request(app).get('/todos');
    expect(res.status).toBe(401);
  });
});

describe('GET /todos', () => {
  test('returns the sorted todo list for the authenticated user', async () => {
    const todos = [{ _id: '1', text: 'Task A', userId }];
    mockTodoModel.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(todos),
    });

    const res = await request(app).get('/todos').set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(todos);
    expect(mockTodoModel.find).toHaveBeenCalledWith({ userId });
  });
});

describe('POST /todos', () => {
  test('rejects an empty text', async () => {
    const res = await request(app)
      .post('/todos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ text: '' });

    expect(res.status).toBe(400);
  });

  test('creates a todo including an optional dueDate', async () => {
    mockTodoModel.countDocuments.mockResolvedValueOnce(0);
    mockTodoModel.create.mockResolvedValueOnce({
      _id: '1',
      text: 'Buy milk',
      dueDate: new Date('2026-01-01T00:00:00.000Z'),
      userId,
    });

    const res = await request(app)
      .post('/todos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ text: 'Buy milk', dueDate: '2026-01-01T00:00:00.000Z' });

    expect(res.status).toBe(201);
    expect(mockTodoModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Buy milk', userId }),
    );
  });
});

describe('PATCH /todos/reorder', () => {
  test('rejects an empty list', async () => {
    const res = await request(app)
      .patch('/todos/reorder')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ orderedIds: [] });

    expect(res.status).toBe(400);
  });

  test('rejects ids that do not belong to the authenticated user', async () => {
    mockTodoModel.countDocuments.mockResolvedValueOnce(1); // only 1 of 2 ids owned

    const res = await request(app)
      .patch('/todos/reorder')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ orderedIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'] });

    expect(res.status).toBe(403);
  });

  test('persists the new order and returns the resorted list', async () => {
    const ids = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
    mockTodoModel.countDocuments.mockResolvedValueOnce(ids.length);
    mockTodoModel.bulkWrite.mockResolvedValueOnce({});
    const resorted = [
      { _id: ids[0], order: 0 },
      { _id: ids[1], order: 1 },
    ];
    mockTodoModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(resorted) });

    const res = await request(app)
      .patch('/todos/reorder')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ orderedIds: ids });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(resorted);
    expect(mockTodoModel.bulkWrite).toHaveBeenCalledWith([
      { updateOne: { filter: { _id: ids[0], userId }, update: { $set: { order: 0 } } } },
      { updateOne: { filter: { _id: ids[1], userId }, update: { $set: { order: 1 } } } },
    ]);
  });
});

describe('DELETE /todos/:id', () => {
  test('rejects a malformed id', async () => {
    const res = await request(app)
      .delete('/todos/not-a-valid-id')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
  });

  test('returns 404 when the todo does not belong to the user', async () => {
    mockTodoModel.findOneAndDelete.mockResolvedValueOnce(null);

    const res = await request(app)
      .delete('/todos/507f1f77bcf86cd799439099')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });
});
