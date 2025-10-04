import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout
import { MainLayout } from './components/Layout/MainLayout';

// Páginas
import { Dashboard } from './pages/Dashboard';
import { NovoPagamento } from './pages/NovoPagamento';
import { NovaReposicao } from './pages/NovaReposicao';
import { EditarLancamento } from './pages/EditarLancamento';
import { DetalhesProcesso } from './pages/DetalhesProcesso';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Configuracoes } from './pages/Configuracoes';

// Componentes que funcionam como páginas, importados de seus locais originais
import { ExtratoGeral } from './components/Dashboard/ExtratoGeral';
import { ListaProcessos } from './components/Dashboard/ListaProcessos';

const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-gray-800 text-white text-center p-8">Carregando...</div>;
  }
  return user ? <MainLayout><Outlet /></MainLayout> : <Navigate to="/login" />;
};

export function Router() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

      {/* Rotas Protegidas com o novo Layout */}
      <Route element={<PrivateRoute />}>
        <Route index element={<Dashboard />} /> 
        <Route path="extrato" element={<ExtratoGeral />} />
        <Route path="processos" element={<ListaProcessos />} />
        
        <Route path="pagamentos/novo" element={<NovoPagamento />} />
        <Route path="reposicoes/nova" element={<NovaReposicao />} />
        <Route path="lancamentos/editar/:id" element={<EditarLancamento />} />
        <Route path="processos/:id" element={<DetalhesProcesso />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>

      {/* Rota de fallback */}
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
    </Routes>
  );
}
