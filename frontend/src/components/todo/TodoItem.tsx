import { useState } from 'react';
import { Trash2, Check, Pencil, Calendar, AlertCircle } from 'lucide-react';
import { format, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { today, getLocalTimeZone } from '@internationalized/date';
import { ptBR } from 'date-fns/locale/pt-BR';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string, dueDate?: string) => void;
}

function getDueDateInfo(dueDate: string) {
  const date = new Date(dueDate);
  const now = new Date();

  if (isPast(date) && !isToday(date)) {
    return { label: 'Overdue', className: 'text-destructive bg-destructive/10' };
  }
  if (isToday(date)) {
    return { label: 'Today', className: 'text-priority-high bg-priority-high/10' };
  }
  if (isTomorrow(date)) {
    return { label: 'Tomorrow', className: 'text-priority-medium bg-priority-medium/10' };
  }
  const days = differenceInDays(date, now);
  if (days <= 7) {
    return { label: format(date, 'EEE'), className: 'text-primary bg-primary/10' };
  }
  return { label: format(date, 'MMM d'), className: 'text-muted-foreground bg-muted' };
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(
    todo.dueDate ? new Date(todo.dueDate) : undefined,
  );

  const handleEditSubmit = () => {
    if (editText.trim()) {
      onEdit(todo._id, editText.trim(), editDueDate?.toISOString());
    }
    setIsEditOpen(false);
  };

  const dueDateInfo = todo.dueDate ? getDueDateInfo(todo.dueDate) : null;
  const isOverdue =
    todo.dueDate &&
    isPast(new Date(todo.dueDate)) &&
    !isToday(new Date(todo.dueDate)) &&
    !todo.completed;

  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-4 rounded-lg border bg-card transition-all duration-200',
        'hover:shadow-md hover:border-primary/20',
        todo.completed && 'opacity-60 grayscale-[0.5]',
        isOverdue && 'border-destructive/40 bg-destructive/[0.02]',
      )}
    >
      <button
        onClick={() => onToggle(todo._id)}
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
          todo.completed
            ? 'bg-primary border-primary text-primary-foreground'
            : isOverdue
              ? 'border-destructive/50'
              : 'border-muted-foreground/40',
        )}
      >
        {todo.completed && <Check size={14} strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium',
            todo.completed && 'line-through text-muted-foreground',
          )}
        >
          {todo.text}
        </p>
        {dueDateInfo && !todo.completed && (
          <div className="flex items-center gap-1.5 mt-1">
            {isOverdue && <AlertCircle size={12} className="text-destructive animate-pulse" />}
            <span
              className={cn(
                'text-[10px] uppercase font-bold px-2 py-0.5 rounded',
                dueDateInfo.className,
              )}
            >
              {dueDateInfo.label}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={() => setIsEditOpen(true)}
        >
          <Pencil size={16} />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={16} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A tarefa será removida permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(todo._id)}
                className="bg-destructive hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input value={editText} onChange={(e) => setEditText(e.target.value)} />
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {editDueDate ? format(editDueDate, 'PPP', { locale: ptBR }) : 'Definir data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    aria-label="Vencimento"
                    minValue={today(getLocalTimeZone())}
                    onChange={(date) => setEditDueDate(date.toDate(getLocalTimeZone()))}
                  />
                </PopoverContent>
              </Popover>
              {editDueDate && (
                <Button variant="ghost" onClick={() => setEditDueDate(undefined)}>
                  Limpar
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
