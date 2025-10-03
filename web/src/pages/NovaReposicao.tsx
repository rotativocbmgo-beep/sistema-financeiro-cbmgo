import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import Input from "@/components/Input";
import toast from 'react-hot-toast';

export function NovaReposicao() {
  const navigate = useNavigate();
  const [data, setData] = useState('');
  const [historico, setHistorico] = useState('');
  const [valor, setValor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateReposicao(event: FormEvent) {
    event.preventDefault();
    if (!data || !historico || !valor) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    const loadingToast = toast.loading('Salvando reposição...');
    setIsSubmitting(true);

    try {
      // CORREÇÃO: Removido o prefixo /api/
      await api.post('/reposicoes', {
        data,
        historico,
        valor: parseFloat(valor),
      });
      
      toast.success("Reposição cadastrada com sucesso!");
      navigate('/');
    } catch (error: any) {
      console.error("Erro ao cadastrar reposição:", error);
      const errorMessage = error.response?.data?.error || "Falha ao cadastrar reposição.";
      toast.error(errorMessage);
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  }

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white p-8">
      <header className="mb-8 flex justify-between items-center max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">Registrar Nova Reposição (Crédito)</h1>
          <p className="text-gray-400">Preencha os dados do lançamento de crédito.</p>
        </div>
        <Link to="/" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          &larr; Voltar ao Dashboard
        </Link>
      </header>

      <main>
        <form onSubmit={handleCreateReposicao} className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <Input label="Histórico*" id="historico" type="text" value={historico} onChange={handleInputChange(setHistorico)} required />
            </div>
            <Input label="Data da Reposição*" id="data" type="date" value={data} onChange={handleInputChange(setData)} required />
            <Input label="Valor (R$)*" id="valor" type="number" step="0.01" placeholder="0.00" value={valor} onChange={handleInputChange(setValor)} required />
          </div>
          <div className="mt-8 text-right">
            <button type="submit" disabled={isSubmitting} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Salvando...' : 'Salvar Reposição'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
