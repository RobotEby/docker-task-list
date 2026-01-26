import { useState } from 'react';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { today, getLocalTimeZone } from '@internationalized/date';

interface TodoInputProps {
  onAdd: (text: string, dueDate?: string) => Promise<unknown>;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(text.trim(), dueDate?.toISOString());
      setText('');
      setDueDate(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Adicionar uma nova tarefa..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 h-11 bg-card border-border focus-visible:ring-primary/30"
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn('h-11 px-3 gap-2', dueDate && 'text-primary border-primary bg-primary/5')}
          >
            <CalendarIcon size={18} />
            {dueDate && (
              <span className="text-xs font-medium">
                {format(dueDate, 'MMM d', { locale: ptBR })}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <CalendarComponent
            aria-label="Data de vencimento"
            minValue={today(getLocalTimeZone())}
            onChange={(dateValue) => setDueDate(dateValue.toDate(getLocalTimeZone()))}
          />
          {dueDate && (
            <div className="p-2 border-t bg-muted/50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setDueDate(undefined)}
              >
                Limpar data
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      <Button type="submit" disabled={!text.trim() || isSubmitting} className="h-11 px-4">
        <Plus size={20} />
      </Button>
    </form>
  );
}
