import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

// Importando os componentes refatorados
import { Graficos } from "../components/Dashboard/Graficos";
import { ExtratoGeral } from "../components/Dashboard/ExtratoGeral";
import { ListaProcessos } from "../components/Dashboard/ListaProcessos";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'graficos' | 'extrato' | 'processos'>('graficos');
  const [saldo, setSaldo] = useState(0);
  const [loadingSaldo, setLoadingSaldo] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    setLoadingSaldo(true);
    api.get('/saldo')
      .then(res => setSaldo(res.data.saldo))
      .catch(err => {
        console.error("Erro ao buscar saldo:", err);
        if (err.response?.status === 401) {
          handleLogout();
        } else {
          toast.error("Não foi possível carregar o saldo.");
        }
      })
      .finally(() => setLoadingSaldo(false));
  }, [logout, navigate]);

  const tabStyle = "py-2 px-4 font-semibold rounded-t-lg transition-colors";
  const activeTabStyle = "bg-gray-900 text-cyan-400";
  const inactiveTabStyle = "bg-gray-800 text-gray-400 hover:bg-gray-700";

  return (
    <div className="min-h-screen bg-gray-800 text-white p-8">
      <header className="mb-8 flex flex-wrap justify-between items-center max-w-7xl mx-auto gap-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">Painel Financeiro</h1>
          <p className="text-gray-400">Bem-vindo(a), {user?.name || 'Usuário'}!</p>
        </div>
        <div className="flex items-center gap-4">
          <div key="action-buttons" className="flex gap-4">
            <Link to="/reposicoes/nova" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg">
              + Nova Reposição
            </Link>
            <Link to="/pagamentos/novo" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">
              + Novo Pagamento
            </Link>
          </div>
          
          {/* --- BOTÕES DE AÇÃO DO USUÁRIO --- */}
          <div className="flex items-center gap-2">
            <Link 
              to="/configuracoes" 
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
              title="Configurações da Conta"
            >
              {/* Ícone de engrenagem (SVG) para melhor visual */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
              title="Sair do sistema"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* O resto do dashboard continua igual... */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">Saldo Total</h2>
          {loadingSaldo ? <p>Calculando...</p> : (
            <p className={`text-4xl font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' } ).format(saldo)}
            </p>
          )}
        </div>

        <div className="mb-4 flex border-b border-gray-700">
          <button onClick={() => setActiveTab('graficos')} className={`${tabStyle} ${activeTab === 'graficos' ? activeTabStyle : inactiveTabStyle}`}>
            Gráficos
          </button>
          <button onClick={() => setActiveTab('extrato')} className={`${tabStyle} ${activeTab === 'extrato' ? activeTabStyle : inactiveTabStyle}`}>
            Extrato Geral
          </button>
          <button onClick={() => setActiveTab('processos')} className={`${tabStyle} ${activeTab === 'processos' ? activeTabStyle : inactiveTabStyle}`}>
            Processos
          </button>
        </div>

        <div>
          {activeTab === 'graficos' && <Graficos />}
          {activeTab === 'extrato' && <ExtratoGeral />}
          {activeTab === 'processos' && <ListaProcessos />}
        </div>
      </main>
    </div>
  );
}
