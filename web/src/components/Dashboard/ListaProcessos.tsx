import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { Skeleton } from '../Skeleton'; // Importando o Skeleton para o estado de loading

interface Processo {
  id: string;
  numero: string;
  credor: string;
  status: 'PENDENTE' | 'LIQUIDADO';
  lancamentos: { valor: number }[];
}

// Componente de Skeleton para a visualização em cards
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

export function ListaProcessos() {
    const [processos, setProcessos] = useState<Processo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get('/processos')
            .then(response => setProcessos(response.data))
            .catch(err => {
                console.error("Erro ao buscar processos:", err);
                toast.error("Falha ao carregar a lista de processos.");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="bg-gray-900 rounded-lg shadow-lg p-4">
                {/* Mostra o skeleton de cards em mobile e uma mensagem simples em desktop */}
                <div className="md:hidden">
                    <CardSkeleton />
                </div>
                <div className="hidden md:block text-center p-4">
                    Carregando processos...
                </div>
            </div>
        );
    }

    if (processos.length === 0) {
        return (
            <div className="bg-gray-900 rounded-lg shadow-lg p-10 text-center text-gray-500">
                Nenhum processo encontrado.
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-lg shadow-lg">
            {/* 1. VISUALIZAÇÃO EM TABELA PARA DESKTOP (md e acima) */}
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

            {/* 2. VISUALIZAÇÃO EM CARDS PARA MOBILE (abaixo de md) */}
            <div className="md:hidden p-4 space-y-4">
                {processos.map(proc => (
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
        </div>
    );
}
