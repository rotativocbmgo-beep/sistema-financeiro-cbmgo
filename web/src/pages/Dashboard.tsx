import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

// Importando o componente do seu local original
import { Graficos } from '../components/Dashboard/Graficos';

export function Dashboard() {
  const { logout } = useAuth();
  const [saldo, setSaldo] = useState(0);
  const [loadingSaldo, setLoadingSaldo] = useState(true);

  useEffect(() => {
    setLoadingSaldo(true);
    api.get('/saldo')
      .then(res => setSaldo(res.data.saldo))
      .catch(err => {
        console.error("Erro ao buscar saldo:", err);
        if (err.response?.status === 401) {
          toast.error("Sessão expirada. Por favor, faça login novamente.");
          logout();
        } else {
          toast.error("Não foi possível carregar o saldo.");
        }
      })
      .finally(() => setLoadingSaldo(false));
  }, [logout]);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-cyan-400">Dashboard</h1>
        <p className="text-gray-400">Visão geral das suas finanças.</p>
      </header>

      <main className="space-y-8">
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">Saldo Total</h2>
          {loadingSaldo ? <p>Calculando...</p> : (
            <p className={`text-4xl font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
            </p>
          )}
        </div>
        
        <Graficos />
      </main>
    </>
  );
}
