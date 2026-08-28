import { Todo } from '../models/Todo.js';
import { ApiError } from '../utils/ApiError.js';
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

    const count = await Todo.countDocuments({ userId: req.userId });

    const newTodo = await Todo.create({
      text: text.trim(),
      dueDate: parsedDueDate,
      order: count,
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

    const ownedCount = await Todo.countDocuments({
      _id: { $in: orderedIds },
      userId: req.userId,
    });
    if (ownedCount !== orderedIds.length) {
      throw new ApiError(403, 'Uma ou mais tarefas não pertencem ao usuário autenticado');
    }

    await Todo.bulkWrite(
      orderedIds.map((id, index) => ({
        updateOne: {
          filter: { _id: id, userId: req.userId },
          update: { $set: { order: index } },
        },
      })),
    );

    const todos = await Todo.find({ userId: req.userId }).sort({ order: 1, createdAt: -1 });
    res.json(todos);
  } catch (err) {
    next(err);
  }
}
