// web/src/hooks/useLancamento.ts

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { format }
from 'date-fns';
import toast from 'react-hot-toast';

// 1. Definir a interface para os dados do formulário do lançamento
interface LancamentoFormData {
  data: string;
  historico: string;
  valor: string;
}

// 2. Definir o retorno do hook para que o componente possa acessar os estados e funções
interface UseLancamentoReturn {
  formData: LancamentoFormData;
  setFormData: React.Dispatch<React.SetStateAction<LancamentoFormData>>;
  loading: boolean;
  isSubmitting: boolean;
  handleUpdateLancamento: (event: React.FormEvent) => Promise<void>;
}

/**
 * Hook customizado para gerenciar a lógica de um lançamento (buscar e atualizar).
 * @param id - O ID do lançamento a ser editado.
 */
export function useLancamento(id: string | undefined): UseLancamentoReturn {
  const navigate = useNavigate();

  // 3. Centralizar os estados do formulário em um único objeto
  const [formData, setFormData] = useState<LancamentoFormData>({
    data: '',
    historico: '',
    valor: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. Encapsular a lógica de busca dos dados iniciais do lançamento
  const fetchLancamento = useCallback(async () => {
    if (!id) {
      navigate('/extrato'); // Redireciona se não houver ID
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get(`/lancamentos/${id}`);
      const lancamento = response.data;
      
      // Atualiza o estado do formulário com os dados recebidos
      setFormData({
        data: format(new Date(lancamento.data), 'yyyy-MM-dd'),
        historico: lancamento.historico,
        valor: String(lancamento.valor),
      });
    } catch (error) {
      toast.error("Falha ao carregar dados do lançamento para edição.");
      navigate('/extrato'); // Redireciona em caso de erro
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // Efeito que executa a busca quando o hook é montado ou o ID muda
  useEffect(() => {
    fetchLancamento();
  }, [fetchLancamento]);

  // 5. Encapsular a lógica de atualização do lançamento
  const handleUpdateLancamento = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.data || !formData.historico || !formData.valor) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Atualizando lançamento...');

    try {
      await api.put(`/lancamentos/${id}`, {
        data: formData.data,
        historico: formData.historico,
        valor: parseFloat(formData.valor),
      });
      
      toast.success("Lançamento atualizado com sucesso!", { id: toastId });
      navigate('/extrato'); // Navega de volta para a lista após o sucesso
    } catch (error: any) {
      const message = error.response?.data?.message || "Falha ao atualizar o lançamento.";
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Retornar os estados e a função para serem usados pelo componente
  return {
    formData,
    setFormData,
    loading,
    isSubmitting,
    handleUpdateLancamento,
  };
}
