// web/src/pages/NovaReposicao.tsx

import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import toast from 'react-hot-toast'; // 1. Importar
import Input from "../components/Input";

export function NovaReposicao() {
  const navigate = useNavigate();
  const [data, setData] = useState('');
  const [historico, setHistorico] = useState('');
  const [valor, setValor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateReposicao(event: FormEvent) {
    event.preventDefault();
    if (!data || !historico || !valor) {
      toast.error("Por favor, preencha todos os campos."); // 2. Substituir alert
      return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading('Salvando reposição...'); // Feedback de carregamento

    try {
      await api.post('/reposicoes', {
        data,
        historico,
        valor: parseFloat(valor),
      });
      toast.success("Reposição cadastrada com sucesso!", { id: toastId }); // 3. Substituir alert
      navigate('/');
    } catch (error: any) {
      console.error("Erro ao cadastrar reposição:", error);
      const message = error.response?.data?.message || "Falha ao cadastrar reposição.";
      toast.error(message, { id: toastId }); // 4. Substituir alert
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">Registrar Nova Reposição (Crédito)</h1>
        <p className="text-gray-400">Insira os dados para adicionar um valor de crédito ao saldo.</p>
      </header>

      <main>
        <form onSubmit={handleCreateReposicao} className="bg-gray-900 p-6 sm:p-8 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input label="Histórico*" id="historico" type="text" value={historico} onChange={e => setHistorico(e.target.value)} required />
            </div>
            <Input label="Data da Reposição*" id="data" type="date" value={data} onChange={e => setData(e.target.value)} required />
            <Input label="Valor (R$)*" id="valor" type="number" step="0.01" placeholder="0.00" value={valor} onChange={e => setValor(e.target.value)} required />
          </div>
          <div className="mt-8">
            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50">
              {isSubmitting ? 'Salvando...' : 'Salvar Reposição'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
