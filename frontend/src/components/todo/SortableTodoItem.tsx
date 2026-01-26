import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Todo } from '@/types/todo';
import { TodoItem } from './TodoItem';
import { cn } from '@/lib/utils';

interface SortableTodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string, dueDate?: string) => void;
}

export function SortableTodoItem({ todo, onToggle, onDelete, onEdit }: SortableTodoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('flex items-center gap-2', isDragging && 'opacity-50 z-50')}
    >
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>
      <div className="flex-1">
        <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
      </div>
    </div>
  );
}
