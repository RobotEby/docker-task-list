import { useState, useEffect, useCallback, useMemo } from 'react';
import { Todo, TodoStats } from '@/types/todo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/todos`);
      if (!res.ok) throw new Error('Falha ao obter tarefas');
      const data = await res.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = useCallback(async (text: string) => {
    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Falha ao adicionar tarefa');
      const newTodo = await res.json();
      setTodos((prev) => [...prev, newTodo]);
      return newTodo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao adicionar tarefa');
      throw err;
    }
  }, []);

  const toggleTodo = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, { method: 'PUT' });
      if (!res.ok) throw new Error('Falha ao atualizar tarefas');
      const updatedTodo = await res.json();
      setTodos((prev) => prev.map((t) => (t._id === id ? updatedTodo : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao atualizar tarefas');
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao excluir tarefa');
    }
  }, []);

  const editTodo = useCallback(async (id: string, newText: string) => {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newText }),
      });
      if (!res.ok) throw new Error('Falha ao editar tarefa');
      const updatedTodo = await res.json();
      setTodos((prev) => prev.map((t) => (t._id === id ? updatedTodo : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao editar tarefa');
    }
  }, []);

  const stats: TodoStats = useMemo(() => {
    const completed = todos.filter((t) => t.completed).length;
    const pending = todos.filter((t) => !t.completed).length;

    return {
      total: todos.length,
      completed,
      pending,
    };
  }, [todos]);

  return {
    todos,
    loading,
    error,
    stats,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    refetch: fetchTodos,
  };
}
