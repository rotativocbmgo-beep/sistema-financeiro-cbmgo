import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import Input from "@/components/Input";
import toast from 'react-hot-toast';

export function NovoPagamento() {
  const navigate = useNavigate();
  const [numero, setNumero] = useState('');
  const [credor, setCredor] = useState('');
  const [dataPagamento, setDataPagamento] = useState('');
  const [valor, setValor] = useState('');
  const [empenhoNumero, setEmpenhoNumero] = useState('');
  const [empenhoVerba, setEmpenhoVerba] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreatePagamento(event: FormEvent) {
    event.preventDefault();
    if (!numero || !credor || !valor || !dataPagamento) {
      toast.error("Por favor, preencha os campos obrigatórios (*).");
      return;
    }
    
    const loadingToast = toast.loading('Salvando pagamento...');
    setIsSubmitting(true);

    try {
      // CORREÇÃO: Removido o prefixo /api/
      await api.post('/processos', {
        numero,
        credor,
        empenhoNumero,
        empenhoVerba,
        dataPagamento,
        valor: parseFloat(valor),
      });

      toast.success("Pagamento cadastrado com sucesso!");
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Falha ao cadastrar pagamento.";
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
          <h1 className="text-3xl font-bold text-cyan-400">Registrar Novo Pagamento</h1>
          <p className="text-gray-400">Preencha os dados do processo.</p>
        </div>
        <Link to="/" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          &larr; Voltar ao Dashboard
        </Link>
      </header>

      <main>
        <form onSubmit={handleCreatePagamento} className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <Input label="Credor*" id="credor" type="text" value={credor} onChange={handleInputChange(setCredor)} required />
            </div>
            <Input label="Nº do Processo*" id="numero" type="text" value={numero} onChange={handleInputChange(setNumero)} required />
            <Input label="Data do Pagamento*" id="dataPagamento" type="date" value={dataPagamento} onChange={handleInputChange(setDataPagamento)} required />
            <Input label="Valor (R$)*" id="valor" type="number" step="0.01" placeholder="0.00" value={valor} onChange={handleInputChange(setValor)} required />
            <Input label="Nº do Empenho" id="empenhoNumero" type="text" value={empenhoNumero} onChange={handleInputChange(setEmpenhoNumero)} />
            <div className="col-span-2">
              <Input label="Verba Orçamentária" id="empenhoVerba" type="text" value={empenhoVerba} onChange={handleInputChange(setEmpenhoVerba)} />
            </div>
          </div>
          <div className="mt-8 text-right">
            <button type="submit" disabled={isSubmitting} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Salvando...' : 'Salvar Pagamento'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
