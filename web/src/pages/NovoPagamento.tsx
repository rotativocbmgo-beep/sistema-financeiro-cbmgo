// web/src/pages/NovoPagamento.tsx

import { FormEvent, useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import toast from 'react-hot-toast';
import Input from "../components/Input";
import { useLayout } from "../contexts/LayoutContext";

export function NovoPagamento() {
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();

  // Estados para os campos do formulário
  const [numero, setNumero] = useState('');
  const [credor, setCredor] = useState('');
  const [dataPagamento, setDataPagamento] = useState('');
  const [valor, setValor] = useState('');
  const [empenhoNumero, setEmpenhoNumero] = useState('');
  const [empenhoVerba, setEmpenhoVerba] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Novos estados para o arquivo e sua pré-visualização
  const [comprovante, setComprovante] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setPageTitle("Registrar Novo Pagamento");
  }, [setPageTitle]);

  // 2. Função para lidar com a seleção do arquivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setComprovante(file);

      // Cria uma URL local para a pré-visualização da imagem
      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null); // Limpa a pré-visualização se não for uma imagem
      }
    }
  };

  async function handleCreatePagamento(event: FormEvent) {
    event.preventDefault();
    if (!numero || !credor || !valor || !dataPagamento) {
      toast.error("Por favor, preencha os campos obrigatórios marcados com *");
      return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading('Cadastrando pagamento...');

    // 3. Usa a API FormData para poder enviar o arquivo junto com os outros dados
    const formData = new FormData();
    formData.append('numero', numero);
    formData.append('credor', credor);
    formData.append('dataPagamento', dataPagamento);
    formData.append('valor', valor);
    if (empenhoNumero) formData.append('empenhoNumero', empenhoNumero);
    if (empenhoVerba) formData.append('empenhoVerba', empenhoVerba);
    
    // Adiciona o arquivo ao FormData se ele existir
    if (comprovante) {
      formData.append('comprovante', comprovante);
    }

    try {
      // 4. Envia o FormData para a API, especificando o Content-Type correto
      await api.post('/processos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success("Pagamento cadastrado com sucesso!", { id: toastId });
      navigate('/processos');
    } catch (error: any) {
      const message = error.response?.data?.message || "Falha ao cadastrar pagamento.";
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

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
              <Input label="Credor*" id="credor" type="text" value={credor} onChange={e => setCredor(e.target.value)} required />
            </div>
            <Input label="Nº do Processo*" id="numero" type="text" value={numero} onChange={e => setNumero(e.target.value)} required />
            <Input label="Data do Pagamento*" id="dataPagamento" type="date" value={dataPagamento} onChange={e => setDataPagamento(e.target.value)} required />
            <Input label="Valor (R$)*" id="valor" type="number" step="0.01" placeholder="0.00" value={valor} onChange={e => setValor(e.target.value)} required />
            <Input label="Nº do Empenho" id="empenhoNumero" type="text" value={empenhoNumero} onChange={e => setEmpenhoNumero(e.target.value)} />
            <div className="md:col-span-2">
              <Input label="Verba Orçamentária" id="empenhoVerba" type="text" value={empenhoVerba} onChange={e => setEmpenhoVerba(e.target.value)} />
            </div>

            {/* 5. NOVO CAMPO DE UPLOAD DE ARQUIVO */}
            <div className="md:col-span-2">
              <label htmlFor="comprovante" className="block text-sm font-medium text-gray-300 mb-1">
                Comprovante (Opcional)
              </label>
              <div className="mt-1 flex items-center gap-4 p-4 border-2 border-dashed border-gray-600 rounded-lg">
                {preview && (
                  <img src={preview} alt="Pré-visualização do comprovante" className="h-20 w-20 object-cover rounded-md" />
                )}
                <div className="flex-1">
                  <input
                    id="comprovante"
                    name="comprovante"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, application/pdf"
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600 cursor-pointer"
                  />
                   <p className="text-xs text-gray-500 mt-1">Tipos permitidos: JPG, PNG, PDF. Tamanho máx: 5MB.</p>
                </div>
              </div>
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
