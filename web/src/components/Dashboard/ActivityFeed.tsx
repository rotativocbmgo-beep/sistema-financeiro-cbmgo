// web/src/components/Dashboard/ActivityFeed.tsx

import { Clock, User } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '../Skeleton';

// --- Interfaces ---
interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: {
    name: string;
  };
}

interface ActivityFeedProps {
  title: string;
  logs: ActivityLog[];
  loading: boolean;
}

// --- Componente Principal ---
export function ActivityFeed({ title, logs, loading }: ActivityFeedProps) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <div className="space-y-4">
        {loading ? (
          // Skeleton de carregamento
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-grow space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : logs.length > 0 ? (
          // Lista de atividades
          logs.map(log => (
            <div key={log.id} className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1 bg-gray-800 p-2 rounded-full">
                <Clock size={20} className="text-cyan-400" />
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-gray-200">{log.action}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <User size={14} />
                  <span>{log.user.name}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: ptBR })}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Mensagem de "Nenhuma atividade"
          <p className="text-center text-gray-500 py-4">Nenhuma atividade recente registrada.</p>
        )}
      </div>
    </div>
  );
}
