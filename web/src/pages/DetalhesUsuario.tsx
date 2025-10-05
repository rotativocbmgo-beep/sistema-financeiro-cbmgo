// web/src/pages/DetalhesUsuario.tsx

import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import toast from 'react-hot-toast';
import { useLayout } from "../contexts/LayoutContext";
import { Skeleton } from "../components/Skeleton";
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock } from "@phosphor-icons/react";

// --- Interfaces ---
interface Permission {
  action: string;
  description: string;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  status: 'PENDENTE' | 'ATIVO' | 'RECUSADO';
  createdAt: string;
  permissions: Permission[];
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: any;
  ipAddress: string;
}

// --- Componente de Skeleton ---
function DetalhesUsuarioSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-24" />
      </header>
      <main className="bg-gray-900 p-6 rounded-lg shadow-lg">
        <Skeleton className="h-6 w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700">
          <Skeleton className="h-6 w-1/4 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700">
          <Skeleton className="h-6 w-1/2 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Componente Principal ---
export function DetalhesUsuario() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();

  const [user, setUser] = useState<UserDetails | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle("Detalhes do Usuário");
  }, [setPageTitle]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [userResponse, activityResponse] = await Promise.all([
        api.get(`/admin/users/${id}`),
        api.get(`/admin/users/${id}/activity`)
      ]);
      setUser(userResponse.data);
      setActivity(activityResponse.data);
    } catch (err) {
      toast.error("Usuário não encontrado ou falha ao carregar dados.");
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <DetalhesUsuarioSkeleton />;
  }

  if (!user) {
    return <div className="p-8 text-center">Usuário não encontrado.</div>;
  }

  const statusInfo = {
    ATIVO: { text: 'Ativo', color: 'bg-green-500 text-green-900' },
    PENDENTE: { text: 'Pendente', color: 'bg-yellow-500 text-yellow-900' },
    RECUSADO: { text: 'Recusado', color: 'bg-red-500 text-red-900' },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-400">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
        <Link to="/admin" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          &larr; Voltar
        </Link>
      </header>

      <main className="bg-gray-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Informações Gerais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-400">ID do Usuário</p>
            <p className="text-lg font-mono text-gray-300 break-all">{user.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Status</p>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusInfo[user.status].color}`}>
              {statusInfo[user.status].text}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-400">Membro Desde</p>
            <p className="text-lg">{format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Permissões Ativas</h2>
          {user.permissions.length > 0 ? (
            <div className="space-y-2">
              {user.permissions.map(permission => (
                <div key={permission.action} className="bg-gray-800 p-3 rounded-md">
                  <p className="font-semibold text-purple-400">{permission.action}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Este usuário não possui permissões ativas.</p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Histórico de Atividades Recentes</h2>
          {activity.length > 0 ? (
            <div className="space-y-4">
              {activity.map(log => (
                <div key={log.id} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <Clock size={20} className="text-gray-500" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-200">{log.action}</p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: ptBR })}
                      {log.ipAddress && log.ipAddress !== 'N/A' && ` • IP: ${log.ipAddress}`}
                    </p>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <pre className="mt-1 text-xs bg-gray-800 p-2 rounded-md text-gray-500 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma atividade recente registrada para este usuário.</p>
          )}
        </div>
      </main>
    </div>
  );
}
