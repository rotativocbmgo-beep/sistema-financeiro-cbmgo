// web/src/pages/NovoPagamento.tsx

import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import toast from 'react-hot-toast'; // 1. Importar o toast
import Input from "../components/Input";

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
      // 2. Substituir alert por toast.error
      toast.error("Por favor, preencha os campos obrigatórios marcados com *");
      return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading('Cadastrando pagamento...'); // Feedback de carregamento

    try {
      await api.post('/processos', {
        numero,
        credor,
        empenhoNumero,
        empenhoVerba,
        dataPagamento,
        valor: parseFloat(valor),
      });
      // 3. Substituir alert por toast.success
      toast.success("Pagamento cadastrado com sucesso!", { id: toastId });
      navigate('/processos');
    } catch (error: any) {
      console.error("Erro ao cadastrar pagamento:", error);
      const message = error.response?.data?.message || "Falha ao cadastrar pagamento.";
      // 4. Substituir alert por toast.error com mensagem dinâmica
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400">Registrar Novo Pagamento</h1>
        <p className="text-gray-400">Preencha os dados do processo para criar um novo pagamento.</p>
      </header>

      <main>
        <form onSubmit={handleCreatePagamento} className="bg-gray-900 p-6 sm:p-8 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input label="Credor*" id="credor" type="text" value={credor} onChange={handleInputChange(setCredor)} required />
            </div>
            <Input label="Nº do Processo*" id="numero" type="text" value={numero} onChange={handleInputChange(setNumero)} required />
            <Input label="Data do Pagamento*" id="dataPagamento" type="date" value={dataPagamento} onChange={handleInputChange(setDataPagamento)} required />
            <Input label="Valor (R$)*" id="valor" type="number" step="0.01" placeholder="0.00" value={valor} onChange={handleInputChange(setValor)} required />
            <Input label="Nº do Empenho" id="empenhoNumero" type="text" value={empenhoNumero} onChange={handleInputChange(setEmpenhoNumero)} />
            <div className="md:col-span-2">
              <Input label="Verba Orçamentária" id="empenhoVerba" type="text" value={empenhoVerba} onChange={handleInputChange(setEmpenhoVerba)} />
            </div>
          </div>
          <div className="mt-8">
            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Salvando...' : 'Salvar Pagamento'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
