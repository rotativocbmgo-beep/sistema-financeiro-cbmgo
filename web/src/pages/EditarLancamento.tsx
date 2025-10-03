import { FormEvent, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "@/services/api";
import Input from "@/components/Input";
import { format } from 'date-fns';
import toast from "react-hot-toast";

export function EditarLancamento() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState('');
  const [historico, setHistorico] = useState('');
  const [valor, setValor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // CORREÇÃO: Removido o prefixo /api/
    api.get(`/lancamentos`)
      .then(response => {
        // A API agora retorna um objeto de paginação, então acessamos response.data.data
        const lancamento = response.data.data.find((l: any) => l.id === id);
        if (lancamento) {
          setData(format(new Date(lancamento.data), 'yyyy-MM-dd'));
          setHistorico(lancamento.historico);
          setValor(String(lancamento.valor));
        } else {
            toast.error("Lançamento não encontrado!");
            navigate('/');
        }
      })
      .catch(err => {
        console.error("Erro ao buscar dados do lançamento:", err);
        toast.error("Falha ao carregar dados para edição.");
        navigate('/');
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  async function handleUpdateLancamento(event: FormEvent) {
    event.preventDefault();
    if (!data || !historico || !valor) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    
    const loadingToast = toast.loading('Salvando alterações...');
    setIsSubmitting(true);
    try {
      // CORREÇÃO: Removido o prefixo /api/
      await api.put(`/lancamentos/${id}`, {
        data,
        historico,
        valor: parseFloat(valor),
      });
      toast.success("Lançamento atualizado com sucesso!");
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Falha ao atualizar lançamento.";
      toast.error(errorMessage);
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-800 text-white p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white p-8">
      <header className="mb-8 flex justify-between items-center max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">Editar Lançamento</h1>
          <p className="text-gray-400">Ajuste os dados do lançamento selecionado.</p>
        </div>
        <Link to="/" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          &larr; Voltar ao Dashboard
        </Link>
      </header>

      <main>
        <form onSubmit={handleUpdateLancamento} className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <Input label="Histórico*" id="historico" type="text" value={historico} onChange={e => setHistorico(e.target.value)} required />
            </div>
            <Input label="Data do Lançamento*" id="data" type="date" value={data} onChange={e => setData(e.target.value)} required />
            <Input label="Valor (R$)*" id="valor" type="number" step="0.01" placeholder="0.00" value={valor} onChange={e => setValor(e.target.value)} required />
          </div>
          <div className="mt-8 text-right">
            <button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
