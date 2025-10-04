import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useLayout } from "../contexts/LayoutContext";
import toast from "react-hot-toast";
import { Graficos } from '../components/Dashboard/Graficos';
import { Skeleton } from "../components/Skeleton";

export function Dashboard() {
  const { logout } = useAuth();
  const { setPageTitle } = useLayout();
  
  const [saldo, setSaldo] = useState<number>(0);
  const [totalDespesas, setTotalDespesas] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle("Dashboard");
  }, [setPageTitle]);

  useEffect(() => {
    async function fetchData() {
      console.log('[Dashboard] Iniciando busca de dados...');
      
      try {
        const [saldoResponse, despesasResponse] = await Promise.all([
          api.get('/saldo'),
          api.get('/total-despesas')
        ]);
        
        console.log('[Dashboard] Resposta saldo:', saldoResponse.data);
        console.log('[Dashboard] Resposta despesas:', despesasResponse.data);
        
        // Garantir que sempre temos um número, mesmo que seja 0
        const saldoValue = Number(saldoResponse.data?.saldo ?? 0);
        const despesasValue = Number(despesasResponse.data?.totalDespesas ?? 0);
        
        console.log('[Dashboard] Valores processados - Saldo:', saldoValue, 'Despesas:', despesasValue);
        
        // CORREÇÃO CRÍTICA: Atualizar TODOS os estados em sequência
        setSaldo(saldoValue);
        setTotalDespesas(despesasValue);
        setLoading(false);
        
        console.log('[Dashboard] Estados atualizados, loading definido como false');

      } catch (err: any) {
        console.error('[Dashboard] Erro ao buscar dados:', err);
        
        if (err.response?.status === 401) {
          toast.error("Sessão expirada. Por favor, faça login novamente.");
          logout();
        } else {
          toast.error("Não foi possível carregar os dados do dashboard.");
        }
        
        // Mesmo com erro, desativar o loading
        setLoading(false);
      }
    }

    fetchData();
  }, [logout, setPageTitle]);

  console.log('[Dashboard] Renderizando - loading:', loading, 'saldo:', saldo, 'totalDespesas:', totalDespesas);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">Saldo Total</h2>
          {loading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <p className={`text-4xl font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
            </p>
          )}
        </div>
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">Total de Despesas</h2>
          {loading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <p className="text-4xl font-bold text-red-400">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDespesas)}
            </p>
          )}
        </div>
      </div>
      <Graficos />
    </div>
  );
}