// web/src/Router.tsx

import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Suspense, lazy } from 'react'; // 1. Importar lazy e Suspense

// Layout
import { MainLayout } from './components/Layout/MainLayout';

// --- Componente de Carregamento para o Suspense ---
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-800">
    <p className="text-white">Carregando página...</p>
  </div>
);

// --- Páginas Públicas (carregadas estaticamente pois são pequenas) ---
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// --- Páginas Privadas (carregadas sob demanda com React.lazy) ---
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const ExtratoGeral = lazy(() => import('./components/Dashboard/ExtratoGeral').then(module => ({ default: module.ExtratoGeral })));
const ListaProcessos = lazy(() => import('./components/Dashboard/ListaProcessos').then(module => ({ default: module.ListaProcessos })));
const NovoPagamento = lazy(() => import('./pages/NovoPagamento').then(module => ({ default: module.NovoPagamento })));
const NovaReposicao = lazy(() => import('./pages/NovaReposicao').then(module => ({ default: module.NovaReposicao })));
const EditarLancamento = lazy(() => import('./pages/EditarLancamento').then(module => ({ default: module.EditarLancamento })));
const DetalhesProcesso = lazy(() => import('./pages/DetalhesProcesso').then(module => ({ default: module.DetalhesProcesso })));
const Configuracoes = lazy(() => import('./pages/Configuracoes').then(module => ({ default: module.Configuracoes })));


// --- Rota Privada ---
const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <PageLoader />; // Mostra um loader enquanto verifica a autenticação
  }
  return user ? <MainLayout><Outlet /></MainLayout> : <Navigate to="/login" />;
};

export function Router() {
  const { user } = useAuth();

  return (
    // 2. Envolver todo o conteúdo das rotas com Suspense
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}
