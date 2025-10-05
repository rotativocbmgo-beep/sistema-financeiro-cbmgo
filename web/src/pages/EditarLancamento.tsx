// web/src/pages/EditarLancamento.tsx

import { FormEvent, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { format } from 'date-fns';
import toast from 'react-hot-toast'; // 1. Importar
import Input from "../components/Input";
import { Skeleton } from "../components/Skeleton"; // 2. Importar Skeleton

export function EditarLancamento() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState('');
  const [historico, setHistorico] = useState('');
  const [valor, setValor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true); // 3. Adicionar estado de loading

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/lancamentos/${id}`) // Assumindo que existe um endpoint para buscar um lançamento
      .then(response => {
        const lancamento = response.data;
        setData(format(new Date(lancamento.data), 'yyyy-MM-dd'));
        setHistorico(lancamento.historico);
        setValor(String(lancamento.valor));
      })
      .catch(() => {
        toast.error("Falha ao carregar dados para edição.");
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleUpdateLancamento(event: FormEvent) {
    event.preventDefault();
    if (!data || !historico || !valor) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading('Atualizando lançamento...');

    try {
      await api.put(`/lancamentos/${id}`, {
        data,
        historico,
        valor: parseFloat(valor),
      });
      toast.success("Lançamento atualizado com sucesso!", { id: toastId });
      navigate('/extrato');
    } catch (error: any) {
      const message = error.response?.data?.message || "Falha ao atualizar lançamento.";
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  // 4. Renderizar o Skeleton enquanto carrega
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-4 w-3/4 mb-8" />
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="text-right">
            <Skeleton className="h-12 w-32 ml-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-400">Editar Lançamento</h1>
        <p className="text-gray-400">Ajuste os dados do lançamento manual selecionado.</p>
      </header>

      <main>
        <form onSubmit={handleUpdateLancamento} className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
          <div className="space-y-6">
            <Input label="Histórico*" id="historico" type="text" value={historico} onChange={e => setHistorico(e.target.value)} required />
            <Input label="Data do Lançamento*" id="data" type="date" value={data} onChange={e => setData(e.target.value)} required />
            <Input label="Valor (R$)*" id="valor" type="number" step="0.01" placeholder="0.00" value={valor} onChange={e => setValor(e.target.value)} required />
          </div>
          <div className="mt-8 text-right">
            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50">
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
