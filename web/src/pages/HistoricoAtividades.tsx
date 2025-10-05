// web/src/pages/HistoricoAtividades.tsx

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useLayout } from '../contexts/LayoutContext';
import { Skeleton } from '../components/Skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User, Funnel } from '@phosphor-icons/react';

// --- Interfaces ---
interface User {
  id: string;
  name: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: any;
  ipAddress: string;
  user: {
    name: string;
  };
}

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// --- Componente Principal ---
export function HistoricoAtividades() {
  const { setPageTitle } = useLayout();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados dos filtros
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  useEffect(() => {
    setPageTitle("Histórico de Atividades");
    api.get('/admin/users', { params: { status: 'ATIVO' } })
      .then(response => setUsers(response.data))
      .catch(() => toast.error("Falha ao carregar lista de usuários para o filtro."));
  }, [setPageTitle]);

  const fetchLogs = useCallback((page: number, filtros: object) => {
    setLoading(true);
    const params = { page, ...filtros };
    api.get('/admin/activity-logs', { params })
      .then(response => {
        setLogs(response.data.data);
        setMeta(response.data.meta);
      })
      .catch(() => toast.error("Falha ao carregar o histórico de atividades."))
      .finally(() => setLoading(false));
  }, []);

  const handleApplyFilters = () => {
    const filtros = {
      userId: filtroUsuario || undefined,
      dataInicio: filtroDataInicio || undefined,
      dataFim: filtroDataFim || undefined,
    };
    setCurrentPage(1);
    fetchLogs(1, filtros);
  };

  const handleClearFilters = () => {
    setFiltroUsuario('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setCurrentPage(1);
    fetchLogs(1, {});
  };

  useEffect(() => {
    const filtros = {
      userId: filtroUsuario,
      dataInicio: filtroDataInicio,
      dataFim: filtroDataFim,
    };
    fetchLogs(currentPage, filtros);
  }, [currentPage, fetchLogs]);

  return (
    <div className="bg-gray-900 p-4 sm:p-6 rounded-lg shadow-lg">
      {/* Cabeçalho e Filtros */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Funnel size={24} className="text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Filtrar Atividades</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="filtro-usuario" className="block text-sm font-medium text-gray-300">Usuário</label>
            <select id="filtro-usuario" value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm">
              <option value="">Todos os usuários</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-data-inicio" className="block text-sm font-medium text-gray-300">De</label>
            <input type="date" id="filtro-data-inicio" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="filtro-data-fim" className="block text-sm font-medium text-gray-300">Até</label>
            <input type="date" id="filtro-data-fim" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleApplyFilters} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Aplicar</button>
            <button onClick={handleClearFilters} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Limpar</button>
          </div>
        </div>
      </div>

      {/* Lista de Atividades */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : logs.length > 0 ? (
          logs.map(log => (
            <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex-shrink-0 mt-1 bg-gray-700 p-2 rounded-full">
                <Clock size={20} className="text-cyan-400" />
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-white">{log.action}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <User size={14} />
                  <span>{log.user.name}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: ptBR })}</span>
                </div>
                {log.details && Object.keys(log.details).length > 0 && (
                  <pre className="mt-2 text-xs bg-gray-900 p-2 rounded-md text-gray-500 overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            Nenhuma atividade encontrada para os filtros selecionados.
          </div>
        )}
      </div>

      {/* Paginação */}
      {meta && meta.totalPages > 1 && !loading && (
        <div className="mt-6 flex items-center justify-between flex-wrap gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 text-sm">Anterior</button>
          <span className="text-xs sm:text-sm text-gray-300">Página {meta.currentPage} de {meta.totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(meta.totalPages, p + 1))} disabled={currentPage === meta.totalPages} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 text-sm">Próxima</button>
        </div>
      )}
    </div>
  );
}
