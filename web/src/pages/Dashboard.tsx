// web/src/pages/Dashboard.tsx

import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useLayout } from "../contexts/LayoutContext";
import toast from "react-hot-toast";
import { Graficos } from '../components/Dashboard/Graficos';
import { Skeleton } from "../components/Skeleton";
import { ActivityFeed } from "../components/Dashboard/ActivityFeed";

// Interface para o log de atividade
interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: {
    name: string;
  };
}

export function Dashboard() {
  const { logout } = useAuth();
  const { setPageTitle } = useLayout();
  
  const [saldo, setSaldo] = useState<number>(0);
  const [totalDespesas, setTotalDespesas] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle("Dashboard");
  }, [setPageTitle]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Buscar todos os dados em paralelo
        const [saldoResponse, despesasResponse, activityResponse] = await Promise.all([
          api.get('/saldo'),
          api.get('/total-despesas'),
          api.get('/recent-activities') // Busca as atividades recentes
        ]);
        
        setSaldo(Number(saldoResponse.data?.saldo ?? 0));
        setTotalDespesas(Number(despesasResponse.data?.totalDespesas ?? 0));
        setRecentActivities(activityResponse.data); // Armazena as atividades no estado

      } catch (err: any) {
        console.error('[Dashboard] Erro ao buscar dados:', err);
        if (err.response?.status === 401) {
          toast.error("Sessão expirada. Por favor, faça login novamente.");
          logout();
        } else {
          toast.error("Não foi possível carregar os dados do dashboard.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [logout, setPageTitle]);

  return (
    <div className="space-y-8">
      {/* Cards de Saldo e Despesas */}
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

      {/* Gráficos */}
      <Graficos />

      {/* Componente de feed de atividades */}
      <ActivityFeed 
        title="Atividades Recentes no Sistema"
        logs={recentActivities}
        loading={loading}
      />
    </div>
  );
}
