// web/src/pages/NovaReposicao.tsx

import { FormEvent, useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import toast from 'react-hot-toast';
import Input from "../components/Input";
import { useLayout } from "../contexts/LayoutContext";

export function NovaReposicao() {
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();

  // Estados do formulário
  const [data, setData] = useState('');
  const [historico, setHistorico] = useState('');
  const [valor, setValor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Novos estados para o arquivo e pré-visualização
  const [comprovante, setComprovante] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setPageTitle("Registrar Nova Reposição (Crédito)");
  }, [setPageTitle]);

  // 2. Função para lidar com a seleção do arquivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setComprovante(file);

      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
    }
  };

  async function handleCreateReposicao(event: FormEvent) {
    event.preventDefault();
    if (!data || !historico || !valor) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading('Salvando reposição...');

    // 3. Usa FormData para enviar o arquivo
    const formData = new FormData();
    formData.append('data', data);
    formData.append('historico', historico);
    formData.append('valor', valor);
    if (comprovante) {
      formData.append('comprovante', comprovante);
    }

    try {
      // 4. Envia o FormData para a API
      await api.post('/reposicoes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Reposição cadastrada com sucesso!", { id: toastId });
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || "Falha ao cadastrar reposição.";
      toast.error(message, { id: toastId });
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
            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50">
              {isSubmitting ? 'Salvando...' : 'Salvar Reposição'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
