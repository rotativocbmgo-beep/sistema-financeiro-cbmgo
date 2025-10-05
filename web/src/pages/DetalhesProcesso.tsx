// web/src/pages/DetalhesProcesso.tsx

import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { usePermissions } from "../hooks/usePermissions";
import { Skeleton } from "../components/Skeleton";

// --- Interfaces ---

interface Lancamento {
  id: string;
  historico: string;
  valor: number;
  tipo: 'CREDITO' | 'DEBITO';
  data: string;
}

// 1. CORREÇÃO: Atualizar a interface Processo para incluir os campos que faltavam
interface Processo {
  id: string;
  numero: string;
  credor: string;
  empenhoNumero: string; // Campo adicionado
  empenhoVerba: string;  // Campo adicionado
  status: 'PENDENTE' | 'LIQUIDADO';
  lancamentos: Lancamento[];
}

// --- Componente de Skeleton (sem alteração) ---
function DetalhesProcessoSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-24" />
      </header>
      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-gray-900 p-6 rounded-lg shadow-lg space-y-6">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </main>
    </div>
  );
}


export function DetalhesProcesso() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const [processo, setProcesso] = useState<Processo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canLiquidar = hasPermission('processo:liquidar');
  const canDelete = hasPermission('lancamento:excluir');

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
    if (!id || processo?.status === 'LIQUIDADO' || !canLiquidar) return;
    if (!window.confirm("Tem certeza que deseja liquidar este processo? Esta ação mudará seu status para LIQUIDADO.")) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Liquidando processo...');

    try {
      await api.patch(`/processos/${id}/liquidar`);
      toast.success("Processo liquidado com sucesso!", { id: toastId });
      fetchProcesso();
    } catch (error: any) {
      const message = error.response?.data?.message || "Falha ao liquidar o processo.";
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !canDelete) return;
    if (!window.confirm("ATENÇÃO: Tem certeza que deseja excluir este processo? Todos os seus lançamentos financeiros associados também serão removidos permanentemente. Esta ação não pode ser desfeita.")) return;

    setIsDeleting(true);
    const toastId = toast.loading('Excluindo processo...');

    try {
      await api.delete(`/processos/${id}`);
      toast.success("Processo excluído com sucesso!", { id: toastId });
      navigate('/processos');
    } catch (error: any) {
      const message = error.response?.data?.message || "Falha ao excluir o processo.";
      toast.error(message, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <DetalhesProcessoSkeleton />;
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
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-gray-700 pb-4">
            <h2 className="text-xl font-bold">Informações Gerais</h2>
            <div className="flex items-center gap-3">
              {processo.status === 'PENDENTE' && canLiquidar && (
                <button
                  onClick={handleLiquidar}
                  disabled={isSubmitting || isDeleting}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Liquidando...' : 'Liquidar Processo'}
                </button>
              )}
              {canDelete && (
                 <button
                    onClick={handleDelete}
                    disabled={isSubmitting || isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? 'Excluindo...' : 'Excluir Processo'}
                  </button>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Credor</p>
              <p className="text-lg">{processo.credor}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Nº do Empenho</p>
              {/* Agora o acesso a 'empenhoNumero' é válido */}
              <p className="text-lg">{processo.empenhoNumero || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Verba Orçamentária</p>
              {/* Agora o acesso a 'empenhoVerba' é válido */}
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
