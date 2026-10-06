/**
 * Pure helpers for the per-user task ordering (`Todo.order`).
 *
 * `order` is only ever compared, never used as an index, so gaps are harmless;
 * what must not happen is two tasks of one user sharing the same value (their
 * relative position would then depend on `createdAt`, silently undoing a
 * reorder). These helpers keep values unique.
 */

/** Next `order` for a new task: one past the current maximum (not the count). */
export function nextOrderValue(highestOrder) {
  return Number.isFinite(highestOrder) ? highestOrder + 1 : 0;
}

/**
 * Computes the `order` updates needed to apply `orderedIds` to `todos`.
 *
 * `todos` is the user's FULL list in its current display order (order asc,
 * createdAt desc). `orderedIds` may be the full list or any subset of it
 * (e.g. a filtered view): the listed tasks are rearranged among the positions
 * they already occupy, so tasks that were not listed keep their place. The
 * whole list is then renumbered 0..n-1, which also heals duplicate or gapped
 * values left by older data.
 *
 * Returns `{ updates: [{ id, order }] }`, containing only tasks whose stored
 * `order` actually changes. Throws if `orderedIds` has an id not in `todos`.
 */
export function computeReorder(todos, orderedIds) {
  const ids = todos.map((todo) => String(todo._id));
  const known = new Set(ids);
  const listed = new Set(orderedIds.map(String));

  for (const id of listed) {
    if (!known.has(id)) {
      throw new Error(`Unknown id: ${id}`);
    }
  }

  const queue = orderedIds.map(String);
  const finalIds = ids.map((id) => (listed.has(id) ? queue.shift() : id));

  const currentOrder = new Map(todos.map((todo) => [String(todo._id), todo.order]));
  const updates = [];
  finalIds.forEach((id, index) => {
    if (currentOrder.get(id) !== index) {
      updates.push({ id, order: index });
    }
  });
  return { updates };
}
