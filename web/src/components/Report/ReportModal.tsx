// web/src/components/Report/ReportModal.tsx

import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { Report } from '../../pages/Reports';

interface ReportModalProps {
  report: Report | null;
  onClose: () => void;
  onSave: () => void;
}

export function ReportModal({ report, onClose, onSave }: ReportModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (report) {
      setTitle(report.title);
      // Garante que o conteúdo seja uma string formatada, mesmo que seja nulo/undefined
      setContent(report.content ? JSON.stringify(report.content, null, 2) : '');
    }
  }, [report]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading(report ? 'Atualizando relatório...' : 'Criando relatório...');
    
    try {
      // Validação para garantir que o conteúdo é um JSON válido antes de enviar
      let parsedContent;
      try {
        parsedContent = content ? JSON.parse(content) : {};
      } catch (e) {
        toast.error("O conteúdo do relatório não é um JSON válido.", { id: toastId });
        setIsSubmitting(false);
        return;
      }

      const payload = { title, content: parsedContent };

      if (report) {
        await api.put(`/reports/${report.id}`, payload);
      } else {
        await api.post('/reports', payload);
      }
      toast.success('Relatório salvo com sucesso!', { id: toastId });
      onSave();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Falha ao salvar o relatório.';
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl h-[90vh] flex flex-col">
        <h3 className="text-xl font-bold text-purple-400 mb-4">{report ? 'Editar Relatório' : 'Novo Relatório'}</h3>
        <div className="flex-grow flex flex-col gap-4">
          <input
            type="text"
            placeholder="Título do Relatório"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          />
          <textarea
            placeholder='Conteúdo do relatório em formato JSON. Ex: { "item": "valor" }'
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 text-white font-mono text-sm resize-none"
          />
        </div>
        <div className="mt-6 flex justify-end gap-4 pt-4 border-t border-gray-700">
          <button onClick={onClose} disabled={isSubmitting} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">Cancelar</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
