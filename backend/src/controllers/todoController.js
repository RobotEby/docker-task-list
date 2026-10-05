import { Todo } from '../models/Todo.js';
import { ApiError } from '../utils/ApiError.js';
import { computeReorder, nextOrderValue } from '../utils/order.js';
import { validateTodoText, validateDueDate, isValidObjectId } from '../utils/validators.js';

export async function listTodos(req, res, next) {
  try {
    const todos = await Todo.find({ userId: req.userId }).sort({ order: 1, createdAt: -1 });
    res.json(todos);
  } catch (err) {
    next(err);
  }
}

export async function createTodo(req, res, next) {
  try {
    const { text, dueDate } = req.body;
    validateTodoText(text);
    const parsedDueDate = validateDueDate(dueDate);

    // One past the current highest value. Using the document count here would
    // reuse an existing `order` after any deletion and silently tie two tasks.
    const last = await Todo.findOne({ userId: req.userId }).sort({ order: -1 }).select('order');
    const order = nextOrderValue(last?.order);

    const newTodo = await Todo.create({
      text: text.trim(),
      dueDate: parsedDueDate,
      order,
      userId: req.userId,
    });

    res.status(201).json(newTodo);
  } catch (err) {
    next(err);
  }
}

export async function toggleTodo(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new ApiError(400, 'Id inválido');
    }

    const todo = await Todo.findOne({ _id: req.params.id, userId: req.userId });
    if (!todo) throw new ApiError(404, 'Tarefa não encontrada');

    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
  } catch (err) {
    next(err);
  }
}

export async function updateTodo(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new ApiError(400, 'Id inválido');
    }

    const { text, dueDate } = req.body;
    const update = {};

    if (text !== undefined) {
      validateTodoText(text);
      update.text = text.trim();
    }
    if (dueDate !== undefined) {
      update.dueDate = validateDueDate(dueDate);
    }

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      update,
      { new: true, runValidators: true },
    );

    if (!updatedTodo) throw new ApiError(404, 'Tarefa não encontrada');
    res.json(updatedTodo);
  } catch (err) {
    next(err);
  }
}

export async function deleteTodo(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new ApiError(400, 'Id inválido');
    }

    const deletedTodo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!deletedTodo) throw new ApiError(404, 'Tarefa não encontrada');
    res.json({ message: 'Tarefa excluída com sucesso' });
  } catch (err) {
    next(err);
  }
}

export async function reorderTodos(req, res, next) {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw new ApiError(400, 'orderedIds deve ser uma lista não vazia de ids');
    }
    if (!orderedIds.every(isValidObjectId)) {
      throw new ApiError(400, 'orderedIds contém um id inválido');
    }
    if (new Set(orderedIds.map(String)).size !== orderedIds.length) {
      throw new ApiError(400, 'orderedIds contém ids duplicados');
    }

    // `orderedIds` may be a subset (e.g. a filtered view). The listed tasks are
    // rearranged among the positions they already hold; the others keep theirs.
    const current = await Todo.find({ userId: req.userId }).sort({ order: 1, createdAt: -1 });
    const owned = new Set(current.map((todo) => String(todo._id)));
    if (!orderedIds.every((id) => owned.has(String(id)))) {
      throw new ApiError(403, 'Uma ou mais tarefas não pertencem ao usuário autenticado');
    }

    const { updates } = computeReorder(current, orderedIds);
    if (updates.length > 0) {
      await Todo.bulkWrite(
        updates.map(({ id, order }) => ({
          updateOne: {
            filter: { _id: id, userId: req.userId },
            update: { $set: { order } },
          },
        })),
      );
    }

    const todos = await Todo.find({ userId: req.userId }).sort({ order: 1, createdAt: -1 });
    res.json(todos);
  } catch (err) {
    next(err);
  }
}
