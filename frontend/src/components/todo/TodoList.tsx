import { useState, useMemo } from 'react';
import { Todo } from '@/types/todo';
import { TodoItem } from './TodoItem';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

type FilterStatus = 'all' | 'pending' | 'completed';

export function TodoList({ todos, onToggle, onDelete, onEdit }: TodoListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const filteredTodos = useMemo(() => {
    switch (filterStatus) {
      case 'pending':
        return todos.filter((t) => !t.completed);
      case 'completed':
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  }, [todos, filterStatus]);

  return (
    <div className="space-y-4">
      <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
        <TabsList className="h-9">
          <TabsTrigger value="all" className="text-xs px-3">
            Todos ({todos.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs px-3">
            Pendente ({todos.filter((t) => !t.completed).length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs px-3">
            Concluído ({todos.filter((t) => t.completed).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {filteredTodos.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">Nenhuma tarefa encontrada</p>
            <p className="text-sm">
              {filterStatus === 'all'
                ? 'Adicione a sua primeira tarefa acima'
                : 'Tente ajustar os seus filtros'}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo, index) => (
            <div
              key={todo._id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
