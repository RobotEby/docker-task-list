import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface TodoInputProps {
  onAdd: (text: string) => Promise<unknown>;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(text.trim());
      setText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Adicionar uma nova tarefa... "
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 h-11 bg-card border-border focus-visible:ring-primary/30"
      />
      <Button type="submit" disabled={!text.trim() || isSubmitting} className="h-11 px-4">
        <Plus size={20} />
      </Button>
    </form>
  );
}
