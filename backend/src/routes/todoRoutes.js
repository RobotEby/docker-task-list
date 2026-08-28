import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import {
  listTodos,
  createTodo,
  toggleTodo,
  updateTodo,
  deleteTodo,
  reorderTodos,
} from '../controllers/todoController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listTodos);
router.post('/', createTodo);
router.patch('/reorder', reorderTodos);
router.put('/:id', toggleTodo);
router.patch('/:id', updateTodo);
router.delete('/:id', deleteTodo);

export default router;
