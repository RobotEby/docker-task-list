import { describe, test, expect } from '@jest/globals';
import { computeReorder, nextOrderValue } from '../../src/utils/order.js';

const todo = (id, order) => ({ _id: id, order });
const apply = (todos, { updates }) => {
  const byId = new Map(updates.map((u) => [u.id, u.order]));
  return todos
    .map((t) => ({ id: t._id, order: byId.has(t._id) ? byId.get(t._id) : t.order }))
    .sort((a, b) => a.order - b.order)
    .map((t) => t.id);
};

describe('nextOrderValue', () => {
  test('starts at 0 when the user has no tasks', () => {
    expect(nextOrderValue(undefined)).toBe(0);
    expect(nextOrderValue(null)).toBe(0);
  });

  test('is one past the highest existing value', () => {
    expect(nextOrderValue(2)).toBe(3);
    // after deleting the first of [0, 1, 2], a count-based value (2) would tie
    expect(nextOrderValue(2)).not.toBe(2);
  });
});

describe('computeReorder', () => {
  const todos = [todo('a', 0), todo('b', 1), todo('c', 2), todo('d', 3)];

  test('full reorder renumbers every task and reports only changes', () => {
    const result = computeReorder(todos, ['d', 'a', 'b', 'c']);
    expect(result.updates).toEqual([
      { id: 'd', order: 0 },
      { id: 'a', order: 1 },
      { id: 'b', order: 2 },
      { id: 'c', order: 3 },
    ]);
  });

  test('no-op reorder yields no updates', () => {
    expect(computeReorder(todos, ['a', 'b', 'c', 'd']).updates).toEqual([]);
  });

  test('partial reorder swaps listed tasks within their own slots', () => {
    // a filtered view showed only a and c; user drops c before a
    const result = computeReorder(todos, ['c', 'a']);
    expect(apply(todos, result)).toEqual(['c', 'b', 'a', 'd']);
    expect(result.updates).toEqual([
      { id: 'c', order: 0 },
      { id: 'a', order: 2 },
    ]);
  });

  test('partial reorder never collides with unlisted tasks', () => {
    const result = computeReorder(todos, ['d', 'c']);
    const orders = todos.map((t) => {
      const u = result.updates.find((x) => x.id === t._id);
      return u ? u.order : t.order;
    });
    expect(new Set(orders).size).toBe(todos.length);
    expect(apply(todos, result)).toEqual(['a', 'b', 'd', 'c']);
  });

  test('single-id partial list changes nothing', () => {
    expect(computeReorder(todos, ['b']).updates).toEqual([]);
  });

  test('heals duplicate and gapped order values', () => {
    const messy = [todo('a', 2), todo('b', 2), todo('c', 7)];
    const result = computeReorder(messy, ['a', 'b', 'c']);
    expect(result.updates).toEqual([
      { id: 'a', order: 0 },
      { id: 'b', order: 1 },
      { id: 'c', order: 2 },
    ]);
  });

  test('throws on an id that is not in the list', () => {
    expect(() => computeReorder(todos, ['a', 'zzz'])).toThrow('Unknown id');
  });
});
