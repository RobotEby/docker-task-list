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

function mockHighestOrder(order) {
  mockTodoModel.findOne.mockReturnValueOnce({
    sort: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(order === undefined ? null : { order }),
    }),
  });
}

describe('POST /todos', () => {
  test('rejects an empty text', async () => {
    const res = await request(app)
      .post('/todos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ text: '' });

    expect(res.status).toBe(400);
  });

  test('creates a todo including an optional dueDate', async () => {
    mockHighestOrder(undefined);
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
      expect.objectContaining({ text: 'Buy milk', userId, order: 0 }),
    );
  });

  test('assigns one past the highest order, even after deletions left a gap', async () => {
    // e.g. tasks with order 1 and 2 remain (order 0 was deleted): count is 2,
    // but the new task must get 3, not 2.
    mockHighestOrder(2);
    mockTodoModel.create.mockResolvedValueOnce({ _id: '9', text: 'New', userId, order: 3 });

    await request(app)
      .post('/todos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ text: 'New' });

    expect(mockTodoModel.create).toHaveBeenCalledWith(expect.objectContaining({ order: 3 }));
  });
});

describe('PATCH /todos/reorder', () => {
  const [A, B, C] = [
    '507f1f77bcf86cd799439011',
    '507f1f77bcf86cd799439012',
    '507f1f77bcf86cd799439013',
  ];
  const stored = [
    { _id: A, order: 0 },
    { _id: B, order: 1 },
    { _id: C, order: 2 },
  ];

  function mockFind(...results) {
    results.forEach((result) =>
      mockTodoModel.find.mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(result) }),
    );
  }

  const reorder = (orderedIds) =>
    request(app)
      .patch('/todos/reorder')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ orderedIds });

  test('rejects an empty list', async () => {
    expect((await reorder([])).status).toBe(400);
  });

  test('rejects duplicate ids', async () => {
    const res = await reorder([A, A]);
    expect(res.status).toBe(400);
    expect(mockTodoModel.bulkWrite).not.toHaveBeenCalled();
  });

  test('rejects ids that do not belong to the authenticated user', async () => {
    mockFind(stored);
    const res = await reorder([A, '507f1f77bcf86cd7994390ff']);
    expect(res.status).toBe(403);
    expect(mockTodoModel.bulkWrite).not.toHaveBeenCalled();
  });

  test('persists a full reorder and returns the resorted list', async () => {
    const resorted = [
      { _id: C, order: 0 },
      { _id: A, order: 1 },
      { _id: B, order: 2 },
    ];
    mockFind(stored, resorted);
    mockTodoModel.bulkWrite.mockResolvedValueOnce({});

    const res = await reorder([C, A, B]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(resorted);
    expect(mockTodoModel.bulkWrite).toHaveBeenCalledWith([
      { updateOne: { filter: { _id: C, userId }, update: { $set: { order: 0 } } } },
      { updateOne: { filter: { _id: A, userId }, update: { $set: { order: 1 } } } },
      { updateOne: { filter: { _id: B, userId }, update: { $set: { order: 2 } } } },
    ]);
  });

  test('a partial reorder only rewrites the slots of the listed tasks', async () => {
    mockFind(stored, stored);
    mockTodoModel.bulkWrite.mockResolvedValueOnce({});

    const res = await reorder([C, A]); // B is not listed and must keep order 1

    expect(res.status).toBe(200);
    expect(mockTodoModel.bulkWrite).toHaveBeenCalledWith([
      { updateOne: { filter: { _id: C, userId }, update: { $set: { order: 0 } } } },
      { updateOne: { filter: { _id: A, userId }, update: { $set: { order: 2 } } } },
    ]);
  });

  test('skips the write entirely when nothing changes', async () => {
    mockFind(stored, stored);
    const res = await reorder([A, B, C]);
    expect(res.status).toBe(200);
    expect(mockTodoModel.bulkWrite).not.toHaveBeenCalled();
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
