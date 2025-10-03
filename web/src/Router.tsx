import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Páginas
import { Dashboard } from './pages/Dashboard';
import { NovoPagamento } from './pages/NovoPagamento';
import { NovaReposicao } from './pages/NovaReposicao';
import { EditarLancamento } from './pages/EditarLancamento';
import { DetalhesProcesso } from './pages/DetalhesProcesso';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Configuracoes } from './pages/Configuracoes'; // <-- 1. IMPORTAR A NOVA PÁGINA

// Componente para rotas privadas
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-gray-800 text-white text-center p-8">Carregando...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

export function Router() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

      {/* Rotas Protegidas */}
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/pagamentos/novo" element={<PrivateRoute><NovoPagamento /></PrivateRoute>} />
      <Route path="/reposicoes/nova" element={<PrivateRoute><NovaReposicao /></PrivateRoute>} />
      <Route path="/lancamentos/editar/:id" element={<PrivateRoute><EditarLancamento /></PrivateRoute>} />
      <Route path="/processos/:id" element={<PrivateRoute><DetalhesProcesso /></PrivateRoute>} />
      <Route path="/configuracoes" element={<PrivateRoute><Configuracoes /></PrivateRoute>} /> {/* <-- 2. ADICIONAR A NOVA ROTA */}

      {/* Rota de fallback */}
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
    </Routes>
  );
}
