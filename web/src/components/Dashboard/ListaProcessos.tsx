import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Processo {
  id: string;
  numero: string;
  credor: string;
  status: 'PENDENTE' | 'LIQUIDADO';
  lancamentos: { valor: number }[];
}

export function ListaProcessos() {
    const [processos, setProcessos] = useState<Processo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/processos')
            .then(response => setProcessos(response.data))
            .catch(err => {
                console.error("Erro ao buscar processos:", err);
                toast.error("Falha ao carregar a lista de processos.");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-center p-4">Carregando processos...</p>;

    return (
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-x-auto">
            <table className="min-w-full w-full">
                <thead className="bg-gray-700">
                    <tr>
                        <th scope="col" className="sticky top-0 z-10 bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Número do Processo</th>
                        <th scope="col" className="sticky top-0 z-10 bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Credor</th>
                        <th scope="col" className="sticky top-0 z-10 bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="sticky top-0 z-10 bg-gray-700 px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {processos.length > 0 ? processos.map(proc => (
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
                    )) : (
                        <tr><td colSpan={4} className="text-center py-10 text-gray-500">Nenhum processo encontrado.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
