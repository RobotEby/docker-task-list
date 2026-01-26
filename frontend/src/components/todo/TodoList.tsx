import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Todo } from '@/types/todo';
import { SortableTodoItem } from './SortableTodoItem';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string, dueDate?: string) => void;
  onReorder?: (activeId: string, overId: string) => void;
}

type FilterStatus = 'all' | 'pending' | 'completed';

export function TodoList({ todos, onToggle, onDelete, onEdit, onReorder }: TodoListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      onReorder(active.id as string, over.id as string);
    }
  };

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
                ? 'Adicione sua primeira tarefa acima'
                : 'Tente ajustar seus filtros'}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTodos.map((t) => t._id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredTodos.map((todo, index) => (
                <div
                  key={todo._id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <SortableTodoItem
                    todo={todo}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                </div>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
