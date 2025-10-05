// web/src/pages/DetalhesProcesso.tsx

import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast'; // 1. Importar

// ... (Interfaces permanecem as mesmas) ...
interface Lancamento {
  id: string;
  historico: string;
  valor: number;
  tipo: 'CREDITO' | 'DEBITO';
  data: string;
}

interface Processo {
  id: string;
  numero: string;
  credor: string;
  empenhoNumero: string;
  empenhoVerba: string;
  status: 'PENDENTE' | 'LIQUIDADO';
  lancamentos: Lancamento[];
}


export function DetalhesProcesso() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [processo, setProcesso] = useState<Processo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProcesso = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.get(`/processos/${id}`);
      setProcesso(response.data);
    } catch (err) {
      toast.error("Processo não encontrado ou falha ao carregar dados.");
      navigate('/processos');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProcesso();
  }, [fetchProcesso]);

  const handleLiquidar = async () => {
    if (!id || processo?.status === 'LIQUIDADO') return;
    if (!window.confirm("Tem certeza que deseja liquidar este processo? Esta ação mudará seu status para LIQUIDADO.")) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Liquidando processo...'); // Feedback

    try {
      await api.patch(`/processos/${id}/liquidar`);
      toast.success("Processo liquidado com sucesso!", { id: toastId }); // 2. Substituir alert
      fetchProcesso();
    } catch (error: any) {
      const message = error.response?.data?.message || "Falha ao liquidar o processo.";
      toast.error(message, { id: toastId }); // 3. Substituir alert
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (O resto do JSX permanece o mesmo) ...
  if (loading) {
    return <div className="p-8 text-center">Carregando detalhes do processo...</div>;
  }

  if (!processo) {
    return <div className="p-8 text-center">Processo não encontrado.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-400">Detalhes do Processo</h1>
          <p className="text-gray-400 font-mono">{processo.numero}</p>
        </div>
        <Link to="/processos" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          &larr; Voltar
        </Link>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-gray-900 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-2">
            <h2 className="text-xl font-bold">Informações Gerais</h2>
            {processo.status === 'PENDENTE' && (
              <button
                onClick={handleLiquidar}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Liquidando...' : 'Liquidar Processo'}
              </button>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Credor</p>
              <p className="text-lg">{processo.credor}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Nº do Empenho</p>
              <p className="text-lg">{processo.empenhoNumero || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Verba Orçamentária</p>
              <p className="text-lg">{processo.empenhoVerba || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                processo.status === 'LIQUIDADO' ? 'bg-green-500 text-green-900' : 'bg-yellow-500 text-yellow-900'
              }`}>
                {processo.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Lançamentos</h2>
          <ul className="space-y-3">
            {processo.lancamentos.length > 0 ? processo.lancamentos.map(lanc => (
              <li key={lanc.id} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{format(new Date(lanc.data), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  <p className="text-xs text-gray-400">{lanc.tipo}</p>
                </div>
                <span className={`font-mono font-bold ${lanc.tipo === 'CREDITO' ? 'text-green-400' : 'text-red-400'}`}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(lanc.valor))}
                </span>
              </li>
            )) : (
              <p className="text-sm text-gray-500">Nenhum lançamento associado.</p>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
