import { useState } from 'react';
import { Trash2, Check, Pencil } from 'lucide-react';
import { Todo } from '@/types/todo';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleEditSubmit = () => {
    if (editText.trim() && editText !== todo.text) {
      onEdit(todo._id, editText.trim());
    }
    setIsEditOpen(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    }
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-4 rounded-lg border bg-card transition-all duration-200',
        'hover:shadow-md hover:border-primary/20',
        todo.completed && 'opacity-60',
      )}
    >
      <button
        onClick={() => onToggle(todo._id)}
        className={cn(
          'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200',
          'flex items-center justify-center',
          todo.completed
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-muted-foreground/40 hover:border-primary',
        )}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {todo.completed && <Check size={12} strokeWidth={3} />}
      </button>

      <p
        className={cn(
          'flex-1 text-foreground leading-relaxed break-words',
          todo.completed && 'line-through text-muted-foreground',
        )}
      >
        {todo.text}
      </p>

      <button
        onClick={() => {
          setEditText(todo.text);
          setIsEditOpen(true);
        }}
        className={cn(
          'flex-shrink-0 p-1.5 rounded-md transition-all duration-200',
          'text-muted-foreground hover:text-primary hover:bg-primary/10',
          'opacity-0 group-hover:opacity-100 focus:opacity-100',
        )}
        aria-label="Edit task"
      >
        <Pencil size={16} />
      </button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className={cn(
              'flex-shrink-0 p-1.5 rounded-md transition-all duration-200',
              'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
              'opacity-0 group-hover:opacity-100 focus:opacity-100',
            )}
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá apagar permanentemente "
              {todo.text.length > 50 ? todo.text.slice(0, 50) + '...' : todo.text}". Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(todo._id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar tarefa</DialogTitle>
          </DialogHeader>
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleEditKeyDown}
            placeholder="Task text..."
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleEditSubmit} disabled={!editText.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
