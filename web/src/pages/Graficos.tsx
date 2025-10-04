import { useState, useCallback, useEffect } from 'react';
import { format, subDays, subMonths, startOfYear } from 'date-fns';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { DonutChart } from '../components/Charts/DonutChart';
import { BarChart } from '../components/Charts/BarChart';
import { Skeleton } from '../components/Skeleton';

function GraficosSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div>
        <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function Graficos() {
  const [donutData, setDonutData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('30d');
  const [dataInicioPersonalizada, setDataInicioPersonalizada] = useState('');
  const [dataFimPersonalizada, setDataFimPersonalizada] = useState('');

  const fetchChartData = useCallback(async () => {
    setLoading(true);
    try {
      let params = {};
      if (periodo === 'custom') {
        if (!dataInicioPersonalizada || !dataFimPersonalizada) {
          toast.error('Por favor, selecione a data de início e fim.');
          setLoading(false);
          return;
        }
        params = {
          dataInicio: dataInicioPersonalizada,
          dataFim: dataFimPersonalizada,
        };
      } else {
        const hoje = new Date();
        let dataInicio: Date | null = null;
        switch (periodo) {
          case '30d': dataInicio = subDays(hoje, 30); break;
          case '6m': dataInicio = subMonths(hoje, 6); break;
          case '1y': dataInicio = startOfYear(hoje); break;
          default: dataInicio = null;
        }
        params = {
          dataInicio: dataInicio ? format(dataInicio, 'yyyy-MM-dd') : undefined,
          dataFim: periodo !== 'all' ? format(hoje, 'yyyy-MM-dd') : undefined,
        };
      }
      const [donutResponse, barResponse] = await Promise.all([
        api.get('/chart-data', { params }),
        api.get('/monthly-chart-data', { params })
      ]);
      setDonutData(donutResponse.data);
      setBarData(barResponse.data);
    } catch (error) {
      console.error("Erro ao buscar dados dos gráficos:", error);
      toast.error("Falha ao carregar os gráficos.");
    } finally {
      setLoading(false);
    }
  }, [periodo, dataInicioPersonalizada, dataFimPersonalizada]);

  useEffect(() => {
    if (periodo !== 'custom') {
      fetchChartData();
    }
  }, [periodo, fetchChartData]);

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <div className="flex flex-wrap justify-between items-end mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">Análise Visual</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="periodo-grafico" className="text-sm text-gray-400">Período:</label>
            <select
              id="periodo-grafico"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="30d">Últimos 30 dias</option>
              <option value="6m">Últimos 6 meses</option>
              <option value="1y">Este ano</option>
              <option value="all">Todo o período</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          {periodo === 'custom' && (
            <>
              <div>
                <label htmlFor="dataInicioCustom" className="block text-sm font-medium text-gray-300">De</label>
                <input type="date" id="dataInicioCustom" value={dataInicioPersonalizada} onChange={e => setDataInicioPersonalizada(e.target.value)} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"/>
              </div>
              <div>
                <label htmlFor="dataFimCustom" className="block text-sm font-medium text-gray-300">Até</label>
                <input type="date" id="dataFimCustom" value={dataFimPersonalizada} onChange={e => setDataFimPersonalizada(e.target.value)} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"/>
              </div>
              <button onClick={fetchChartData} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm">
                Aplicar
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? <GraficosSkeleton /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {/* CORREÇÃO FINAL: Adicionando o modificador ! para forçar a cor */}
            <h3 className="text-lg font-semibold text-center mb-4 !text-gray-200">Top 5 Despesas</h3>
            {donutData.length > 0 
              ? <DonutChart data={donutData} /> 
              : <p className="text-center text-gray-500 mt-8">Sem dados de despesa para o período.</p>
            }
          </div>
          <div>
            {/* CORREÇÃO FINAL: Adicionando o modificador ! para forçar a cor */}
            <h3 className="text-lg font-semibold text-center mb-4 !text-gray-200">Receitas vs Despesas Mensais</h3>
            {barData.length > 0 
              ? <BarChart data={barData} /> 
              : <p className="text-center text-gray-500 mt-8">Sem dados de lançamentos para o período.</p>
            }
          </div>
        </div>
      )}
    </div>
  );
}
