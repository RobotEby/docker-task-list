import { useState, useEffect, useCallback, useMemo } from 'react';
import { Todo, TodoStats } from '@/types/todo';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useTodos() {
  const { token, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token.trim()}`;
    }
    return headers;
  }, [token]);

  const handleUnauthorized = useCallback(
    (res: Response) => {
      if (res.status === 401) {
        logout();
        return true;
      }
      return false;
    },
    [logout],
  );

  const fetchTodos = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = getHeaders();

      if (!headers['Authorization'] || headers['Authorization'] === 'Bearer undefined') {
        console.warn('Tentativa de busca sem token válido.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/todos`, {
        headers: headers,
      });

      if (handleUnauthorized(res)) return;

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Falha ao buscar tarefas');
      }

      const data = await res.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  }, [token, getHeaders, handleUnauthorized]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = useCallback(
    async (text: string, dueDate?: string) => {
      try {
        const res = await fetch(`${API_URL}/todos`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ text, dueDate }),
        });

        if (handleUnauthorized(res)) return;
        if (!res.ok) throw new Error('Falha ao adicionar tarefa');

        const newTodo = await res.json();
        setTodos((prev) => [...prev, newTodo]);
        return newTodo;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao adicionar tarefa');
        throw err;
      }
    },
    [getHeaders, handleUnauthorized],
  );

  const toggleTodo = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/todos/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
        });

        if (handleUnauthorized(res)) return;
        if (!res.ok) throw new Error('Falha ao atualizar tarefas');

        const updatedTodo = await res.json();
        setTodos((prev) => prev.map((t) => (t._id === id ? updatedTodo : t)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao atualizar tarefas');
      }
    },
    [getHeaders, handleUnauthorized],
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/todos/${id}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });

        if (handleUnauthorized(res)) return;

        setTodos((prev) => prev.filter((t) => t._id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao excluir tarefa');
      }
    },
    [getHeaders, handleUnauthorized],
  );

  const editTodo = useCallback(
    async (id: string, newText: string, dueDate?: string) => {
      try {
        const res = await fetch(`${API_URL}/todos/${id}`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ text: newText, dueDate }),
        });

        if (handleUnauthorized(res)) return;
        if (!res.ok) throw new Error('Falha ao editar tarefa');

        const updatedTodo = await res.json();
        setTodos((prev) => prev.map((t) => (t._id === id ? updatedTodo : t)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao editar tarefa');
      }
    },
    [getHeaders, handleUnauthorized],
  );

  const reorderTodos = useCallback(
    async (activeId: string, overId: string) => {
      setTodos((prev) => {
        const oldIndex = prev.findIndex((t) => t._id === activeId);
        const newIndex = prev.findIndex((t) => t._id === overId);

        if (oldIndex === -1 || newIndex === -1) return prev;

        const newTodos = [...prev];
        const [removed] = newTodos.splice(oldIndex, 1);
        newTodos.splice(newIndex, 0, removed);

        return newTodos;
      });

      try {
        await fetch(`${API_URL}/todos/reorder`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ activeId, overId }),
        });
      } catch {}
    },
    [getHeaders],
  );

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
    reorderTodos,
    refetch: fetchTodos,
  };
}
