import { TodoStats } from '@/types/todo';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle2, Clock, Target } from 'lucide-react';

interface StatsPanelProps {
  stats: TodoStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target size={16} />
            Taxa de conclusão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  className="stroke-muted"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  className="stroke-primary transition-all duration-500 ease-out"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${completionRate * 3.52} 352`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{completionRate}%</span>
                <span className="text-xs text-muted-foreground">Completo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle2 size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Concluído</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Clock size={18} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pendente</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="text-center">
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total de Tarefas</p>
        </div>
      </Card>
    </div>
  );
}
