import { useState, useEffect } from 'react';
import { Moon, Sun, RefreshCw, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TodoInput, TodoList, StatsPanel } from '@/components/todo';
import { useTodos } from '@/hooks/useTodos';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Index = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { todos, loading, error, stats, addTodo, toggleTodo, deleteTodo, editTodo, refetch } =
    useTodos();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Docker To-Do List 🐋</h1>
              <p className="text-sm text-muted-foreground">
                {stats.pending} Pendente · {stats.completed} concluído
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Conta</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error} —{' '}
            <button onClick={refetch} className="underline">
              Tente novamente
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <TodoInput onAdd={addTodo} />

            {loading && todos.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <RefreshCw size={24} className="mx-auto mb-2 animate-spin" />
                <p>A carregar tarefas...</p>
              </div>
            ) : (
              <TodoList
                todos={todos}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
              />
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <StatsPanel stats={stats} />
            </div>
          </aside>
        </div>

        <div className="lg:hidden mt-8 pt-6 border-t">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="font-medium">Estatísticas</span>
              <span className="text-muted-foreground text-sm group-open:hidden">Mostrar</span>
              <span className="text-muted-foreground text-sm hidden group-open:inline">
                Esconder
              </span>
            </summary>
            <div className="mt-4">
              <StatsPanel stats={stats} />
            </div>
          </details>
        </div>
      </main>
    </div>
  );
};

export default Index;
