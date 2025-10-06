// web/src/components/Layout/Sidebar.tsx

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { Power, Gear, ChartBar, Bank, Files, Users, ClipboardText, Clock } from "@phosphor-icons/react";

export function Sidebar() {
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyle = "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:bg-gray-700 hover:text-white";
  const activeNavLinkStyle = "bg-gray-700 text-white";

  const canManageUsers = hasPermission('usuario:gerenciar');
  const canViewReports = hasPermission('relatorio:visualizar');

  return (
    <div className="flex h-full max-h-screen flex-col gap-2 bg-gray-900">
      <div className="flex h-16 items-center border-b border-gray-700 px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
          <Bank size={24} className="text-cyan-400" />
          <span>CBMGO Financeiro</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          <NavLink to="/" end className={({ isActive }) => `${navLinkStyle} ${isActive ? activeNavLinkStyle : ''}`}>
            <ChartBar size={18} />
            Gráficos
          </NavLink>
          <NavLink to="/extrato" className={({ isActive }) => `${navLinkStyle} ${isActive ? activeNavLinkStyle : ''}`}>
            <Files size={18} />
            Extrato Geral
          </NavLink>
          <NavLink to="/processos" className={({ isActive }) => `${navLinkStyle} ${isActive ? activeNavLinkStyle : ''}`}>
            <Files size={18} />
            Processos
          </NavLink>
          
          {canViewReports && (
            <NavLink to="/reports" className={({ isActive }) => `${navLinkStyle} ${isActive ? activeNavLinkStyle : ''}`}>
              <ClipboardText size={18} />
              Relatórios
            </NavLink>
          )}
          
          {canManageUsers && (
            <>
              {/* 
                ======================================================================
                == CORREÇÃO APLICADA AQUI ==
                ======================================================================
                Adicionamos a propriedade 'end' ao NavLink de "Administração".
                Isso garante que ele só será considerado "ativo" quando a URL for
                exatamente "/admin", e não em sub-rotas como "/admin/history".
              */}
              <NavLink to="/admin" end className={({ isActive }) => `${navLinkStyle} ${isActive ? activeNavLinkStyle : ''}`}>
                <Users size={18} />
                Administração
              </NavLink>
              
              <NavLink to="/admin/history" className={({ isActive }) => `${navLinkStyle} ${isActive ? activeNavLinkStyle : ''}`}>
                <Clock size={18} />
                Histórico de Atividades
              </NavLink>
            </>
          )}
        </nav>

        <div className="mt-6 px-4 space-y-2">
            <Link to="/reposicoes/nova" className="w-full flex justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-3 text-sm text-center rounded-lg">
              + Nova Reposição
            </Link>
            <Link to="/pagamentos/novo" className="w-full flex justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-3 text-sm text-center rounded-lg">
              + Novo Pagamento
            </Link>
        </div>
      </div>

      <div className="mt-auto border-t border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-gray-300">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-200">{user?.name}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
                <Link to="/configuracoes" title="Configurações" className="p-2 rounded-md hover:bg-gray-700 hover:text-white">
                    <Gear size={20} />
                </Link>
                <button onClick={handleLogout} title="Sair" className="p-2 rounded-md hover:bg-gray-700 text-red-500 hover:text-red-400">
                    <Power size={20} />
                </button>
            </div>
          </div>
      </div>
    </div>
  );
}
