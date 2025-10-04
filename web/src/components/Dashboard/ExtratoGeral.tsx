import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { Skeleton } from '../Skeleton';

interface Lancamento {
  id: string;
  historico: string;
  valor: number;
  tipo: 'CREDITO' | 'DEBITO';
  data: string;
  processoId: string | null;
}

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

function ExtratoSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left"><Skeleton className="h-4 w-16" /></th>
            <th className="px-6 py-3 text-left"><Skeleton className="h-4 w-40" /></th>
            <th className="px-6 py-3 text-right"><Skeleton className="h-4 w-24 ml-auto" /></th>
            <th className="px-6 py-3 text-center"><Skeleton className="h-4 w-20 mx-auto" /></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {Array.from({ length: 10 }).map((_, index) => (
            <tr key={index}>
              <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
              <td className="px-6 py-4"><Skeleton className="h-4 w-3/4" /></td>
              <td className="px-6 py-4"><Skeleton className="h-4 w-28 ml-auto" /></td>
              <td className="px-6 py-4"><Skeleton className="h-4 w-24 mx-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ExtratoGeral() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const fetchData = useCallback((page: number, filtros: object) => {
    setLoading(true);
    const params = { page, pageSize: 10, ...filtros };
    api.get('/lancamentos', { params })
      .then(response => {
        setLancamentos(response.data.data);
        setMeta(response.data.meta);
      })
      .catch(error => {
        console.error("Erro ao buscar lançamentos:", error);
        toast.error("Falha ao carregar o extrato.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApplyFilters = useCallback(() => {
    const filtros = {
      dataInicio: filtroDataInicio || undefined,
      dataFim: filtroDataFim || undefined,
      tipo: filtroTipo || undefined,
    };
    setCurrentPage(1);
    fetchData(1, filtros);
  }, [filtroDataInicio, filtroDataFim, filtroTipo, fetchData]);

  useEffect(() => {
    const filtros = {
      dataInicio: filtroDataInicio || undefined,
      dataFim: filtroDataFim || undefined,
      tipo: filtroTipo || undefined,
    };
    fetchData(currentPage, filtros);
  }, [currentPage, fetchData]);

  const handleClearFilters = () => {
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroTipo('');
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
        fetchData(1, {});
    }
  };

  async function handleDelete(lancamentoId: string) {
    if (!window.confirm("Tem certeza que deseja excluir este lançamento?")) return;
    try {
      await api.delete(`/lancamentos/${lancamentoId}`);
      toast.success("Lançamento excluído com sucesso!");
      fetchData(currentPage, { dataInicio: filtroDataInicio, dataFim: filtroDataFim, tipo: filtroTipo });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Falha ao excluir o lançamento.");
    }
  }

  const handleDownload = (data: BlobPart, fileName: string) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    toast.loading('Gerando seu arquivo CSV...', { id: 'export-csv' });
    try {
      const filtros = { dataInicio: filtroDataInicio || undefined, dataFim: filtroDataFim || undefined, tipo: filtroTipo || undefined };
      const response = await api.get('/export/csv', { params: filtros, responseType: 'blob' });
      handleDownload(response.data, `extrato-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('Download CSV iniciado!', { id: 'export-csv' });
    } catch (error) {
      toast.error('Falha ao gerar o CSV.', { id: 'export-csv' });
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    toast.loading('Gerando seu relatório PDF...', { id: 'export-pdf' });
    try {
      const filtros = { dataInicio: filtroDataInicio || undefined, dataFim: filtroDataFim || undefined, tipo: filtroTipo || undefined };
      const response = await api.get('/export/pdf', { params: filtros, responseType: 'blob' });
      handleDownload(response.data, `relatorio-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('Download PDF iniciado!', { id: 'export-pdf' });
    } catch (error) {
      toast.error('Falha ao gerar o PDF.', { id: 'export-pdf' });
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg">
      <div className="p-4 bg-gray-800 rounded-t-lg flex flex-wrap items-end gap-4">
        <div className="flex-grow sm:flex-grow-0">
          <label htmlFor="dataInicio" className="block text-xs font-medium text-gray-300">Data Início</label>
          <input type="date" id="dataInicio" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"/>
        </div>
        <div className="flex-grow sm:flex-grow-0">
          <label htmlFor="dataFim" className="block text-xs font-medium text-gray-300">Data Fim</label>
          <input type="date" id="dataFim" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"/>
        </div>
        <div className="flex-grow sm:flex-grow-0">
          <label htmlFor="tipo" className="block text-xs font-medium text-gray-300">Tipo</label>
          <select id="tipo" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos</option>
            <option value="CREDITO">Crédito</option>
            <option value="DEBITO">Débito</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
            <button onClick={handleApplyFilters} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Filtrar</button>
            <button onClick={handleClearFilters} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Limpar</button>
            <button onClick={handleExportCSV} disabled={isExportingCSV || isExportingPDF} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50">
            {isExportingCSV ? '...' : 'CSV'}
            </button>
            <button onClick={handleExportPDF} disabled={isExportingPDF || isExportingCSV} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50">
            {isExportingPDF ? '...' : 'PDF'}
            </button>
        </div>
      </div>

      {loading ? <ExtratoSkeleton /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full w-full">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="sticky top-0 z-10 bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                <th scope="col" className="sticky top-0 z-10 bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Histórico</th>
                <th scope="col" className="sticky top-0 z-10 bg-gray-700 px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
                <th scope="col" className="sticky top-0 z-10 bg-gray-700 px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {lancamentos.length > 0 ? lancamentos.map(lanc => (
                <tr key={lanc.id} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{format(new Date(lanc.data), 'dd/MM/yyyy', { locale: ptBR })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{lanc.historico}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-bold ${lanc.tipo === 'CREDITO' ? 'text-green-400' : 'text-red-400'}`}>
                    {lanc.tipo === 'CREDITO' ? '+ ' : '- '}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(lanc.valor))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {!lanc.processoId && (
                      <div className="flex justify-center gap-4">
                        <Link to={`/lancamentos/editar/${lanc.id}`} className="text-blue-400 hover:text-blue-600">Editar</Link>
                        <button onClick={() => handleDelete(lanc.id)} className="text-red-400 hover:text-red-600">Excluir</button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center py-10 text-gray-500">Nenhum lançamento encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {meta && meta.totalPages > 1 && !loading && (
        <div className="bg-gray-700 px-4 py-3 flex items-center justify-between rounded-b-lg flex-wrap gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 text-sm">Anterior</button>
          <span className="text-xs sm:text-sm text-gray-300">Página {meta.currentPage} de {meta.totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(meta.totalPages, p + 1))} disabled={currentPage === meta.totalPages} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 text-sm">Próxima</button>
        </div>
      )}
    </div>
  );
}
