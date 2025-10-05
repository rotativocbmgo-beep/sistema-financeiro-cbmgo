// web/src/pages/Reports.tsx

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useLayout } from '../contexts/LayoutContext';
import { usePermissions } from '../hooks/usePermissions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, FilePdf, Pen, CheckCircle, Seal } from '@phosphor-icons/react';
import { ReportModal } from '../components/Report/ReportModal';
import { ReportViewModal } from '../components/Report/ReportViewModal';

// --- Interfaces ---
export interface Report {
  id: string;
  title: string;
  status: 'RASCUNHO' | 'FINALIZADO' | 'ASSINADO';
  creator: { name: string };
  updatedAt: string;
  content?: any;
  signatures?: { user: { name: string }, signedAt: string }[];
}

// --- Componente Principal ---
export function Reports() {
  const { setPageTitle } = useLayout();
  const { hasPermission } = usePermissions();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  // Permissões
  const canCreate = hasPermission('relatorio:criar');
  const canView = hasPermission('relatorio:visualizar');

  useEffect(() => {
    setPageTitle("Relatórios Descritivos");
  }, [setPageTitle]);

  const fetchReports = useCallback(() => {
    if (!canView) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get('/reports')
      .then(response => setReports(response.data))
      .catch(() => toast.error("Falha ao carregar relatórios."))
      .finally(() => setLoading(false));
  }, [canView]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSaveReport = () => {
    setIsModalOpen(false);
    setEditingReport(null);
    fetchReports();
  };

  const handleOpenCreate = () => {
    setEditingReport(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (report: Report) => {
    setEditingReport(report);
    setIsModalOpen(true);
  };

  const handleOpenView = async (reportId: string) => {
    try {
      const response = await api.get(`/reports/${reportId}`);
      setViewingReport(response.data);
    } catch (error) {
      toast.error("Não foi possível carregar os detalhes do relatório.");
    }
  };

  const handleAction = async (action: 'finalize' | 'sign' | 'export', reportId: string) => {
    const toastId = toast.loading(`Executando ação: ${action}...`);
    try {
      if (action === 'export') {
        const response = await api.get(`/reports/${reportId}/export`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relatorio-${reportId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Download do PDF iniciado!", { id: toastId });
      } else {
        await api.post(`/reports/${reportId}/${action}`);
        toast.success("Ação concluída com sucesso!", { id: toastId });
        fetchReports(); // Atualiza a lista
        if (viewingReport?.id === reportId) { // Se estiver visualizando, atualiza os dados
            const response = await api.get(`/reports/${reportId}`);
            setViewingReport(response.data);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Falha ao executar a ação.`, { id: toastId });
    }
  };

  if (!canView) {
    return <div className="text-center text-red-400">Você não tem permissão para visualizar esta página.</div>;
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        {canCreate && (
          <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">
            <Plus size={18} /> Novo Relatório
          </button>
        )}
      </div>

      {loading ? <p>Carregando...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Criador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Última Modificação</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {reports.map(report => (
                <tr key={report.id}>
                  <td className="px-6 py-4">
                    <button onClick={() => handleOpenView(report.id)} className="text-purple-400 hover:underline font-semibold">
                      {report.title}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'RASCUNHO' ? 'bg-yellow-500 text-yellow-900' :
                      report.status === 'FINALIZADO' ? 'bg-blue-500 text-blue-900' : 'bg-green-500 text-green-900'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{report.creator.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{format(new Date(report.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-3">
                      {report.status === 'RASCUNHO' && hasPermission('relatorio:criar') && <button onClick={() => handleOpenEdit(report)} title="Editar" className="text-gray-400 hover:text-white"><Pen size={20} /></button>}
                      {report.status === 'RASCUNHO' && hasPermission('relatorio:criar') && <button onClick={() => handleAction('finalize', report.id)} title="Finalizar" className="text-blue-400 hover:text-blue-300"><CheckCircle size={20} /></button>}
                      {report.status === 'FINALIZADO' && hasPermission('relatorio:assinar') && <button onClick={() => handleAction('sign', report.id)} title="Assinar" className="text-green-400 hover:text-green-300"><Seal size={20} /></button>}
                      {hasPermission('relatorio:exportar') && <button onClick={() => handleAction('export', report.id)} title="Exportar PDF" className="text-red-400 hover:text-red-300"><FilePdf size={20} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && <ReportModal report={editingReport} onClose={() => setIsModalOpen(false)} onSave={handleSaveReport} />}
      {viewingReport && <ReportViewModal report={viewingReport} onClose={() => setViewingReport(null)} onAction={handleAction} />}
    </div>
  );
}
