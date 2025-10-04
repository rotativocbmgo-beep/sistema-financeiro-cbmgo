// web/src/components/Dashboard/ListaProcessos.tsx

import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { Skeleton } from '../Skeleton';
import { useLayout } from '../../contexts/LayoutContext';

// --- Interfaces ---
interface Processo {
  id: string;
  numero: string;
  credor: string;
  status: 'PENDENTE' | 'LIQUIDADO';
  lancamentos: { valor: number }[];
}

// Nova interface para os metadados de paginação
interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// --- Componentes de Skeleton ---
function CardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md animate-pulse">
          <div className="flex justify-between items-center mb-3">
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-5 w-1/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full w-full">
                <thead className="bg-gray-700">
                    <tr>
                        <th className="px-6 py-3"><Skeleton className="h-4 w-24" /></th>
                        <th className="px-6 py-3"><Skeleton className="h-4 w-32" /></th>
                        <th className="px-6 py-3"><Skeleton className="h-4 w-20" /></th>
                        <th className="px-6 py-3"><Skeleton className="h-4 w-28 ml-auto" /></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {Array.from({ length: 10 }).map((_, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-3/4" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-5/6" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-24 ml-auto" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


// --- Componente Principal ---
export function ListaProcessos() {
    const { setPageTitle } = useLayout();
    const [processos, setProcessos] = useState<Processo[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPageTitle("Processos");
    }, [setPageTitle]);

    const fetchData = useCallback((page: number) => {
        setLoading(true);
        // Define os parâmetros de paginação para a chamada da API
        const params = { page, pageSize: 10 };
        api.get('/processos', { params })
            .then(response => {
                // A resposta agora contém 'data' e 'meta'
                setProcessos(response.data.data);
                setMeta(response.data.meta);
            })
            .catch(err => {
                console.error("Erro ao buscar processos:", err);
                toast.error("Falha ao carregar a lista de processos.");
            })
            .finally(() => setLoading(false));
    }, []);

    // useEffect agora dispara a busca sempre que a página atual muda
    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage, fetchData]);

    if (loading && currentPage === 1) {
        return (
            <div className="bg-gray-900 rounded-lg shadow-lg p-4">
                <div className="md:hidden">
                    <CardSkeleton />
                </div>
                <div className="hidden md:block">
                    <TableSkeleton />
                </div>
            </div>
        );
    }

    if (processos.length === 0 && !loading) {
        return (
            <div className="bg-gray-900 rounded-lg shadow-lg p-10 text-center text-gray-500">
                Nenhum processo encontrado.
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-lg shadow-lg">
            {/* --- Conteúdo (Tabela ou Cards) --- */}
            {loading ? (
                <div className="hidden md:block">
                    <TableSkeleton />
                </div>
            ) : (
                <>
                    {/* VISUALIZAÇÃO EM TABELA PARA DESKTOP */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Número do Processo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Credor</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {processos.map(proc => (
                                    <tr key={proc.id} className="hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link to={`/processos/${proc.id}`} className="text-purple-400 hover:underline font-mono text-sm">
                                                {proc.numero}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{proc.credor}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${proc.status === 'LIQUIDADO' ? 'bg-green-500 text-green-900' : 'bg-yellow-500 text-yellow-900'}`}>
                                                {proc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-sm">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(proc.lancamentos[0]?.valor || 0))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* VISUALIZAÇÃO EM CARDS PARA MOBILE */}
                    <div className="md:hidden p-4 space-y-4">
                        {loading ? <CardSkeleton /> : processos.map(proc => (
                            <Link to={`/processos/${proc.id}`} key={proc.id} className="block bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="font-mono text-purple-400 text-sm break-all">{proc.numero}</div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${proc.status === 'LIQUIDADO' ? 'bg-green-500 text-green-900' : 'bg-yellow-500 text-yellow-900'}`}>
                                        {proc.status}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div>
                                        <p className="text-xs text-gray-400">Credor</p>
                                        <p className="text-sm font-medium">{proc.credor}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Valor</p>
                                        <p className="text-sm font-mono font-bold">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(proc.lancamentos[0]?.valor || 0))}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}

            {/* --- Controles de Paginação --- */}
            {meta && meta.totalPages > 1 && (
                <div className="bg-gray-700 px-4 py-3 flex items-center justify-between rounded-b-lg flex-wrap gap-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1 || loading} 
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 text-sm"
                    >
                        Anterior
                    </button>
                    <span className="text-xs sm:text-sm text-gray-300">
                        Página {meta.currentPage} de {meta.totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(meta.totalPages, p + 1))} 
                        disabled={currentPage === meta.totalPages || loading} 
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 text-sm"
                    >
                        Próxima
                    </button>
                </div>
            )}
        </div>
    );
}
