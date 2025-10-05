// web/src/pages/Conta.tsx

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { Gear, Power, CaretRight, ClipboardText, Users, Clock } from "@phosphor-icons/react";
import { useLayout } from "../contexts/LayoutContext";
import { useEffect } from "react";

export function Conta() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();
  const { hasPermission } = usePermissions();

  const canViewReports = hasPermission('relatorio:visualizar');
  const canManageUsers = hasPermission('usuario:gerenciar');

  useEffect(() => {
    setPageTitle("Minha Conta");
  }, [setPageTitle]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Informações do Usuário */}
      <div className="flex flex-col items-center p-6 bg-gray-900 rounded-lg shadow-lg mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center font-bold text-4xl text-gray-300 mb-4">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-white">{user?.name}</h2>
        <p className="text-sm text-gray-400">{user?.email}</p>
      </div>

      {/* Menu de Ações */}
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <nav className="divide-y divide-gray-700">
          {canViewReports && (
            <Link to="/reports" className="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-4">
                <ClipboardText size={24} className="text-cyan-400" />
                <span className="font-medium text-white">Relatórios</span>
              </div>
              <CaretRight size={20} className="text-gray-500" />
            </Link>
          )}

          {canManageUsers && (
            <Link to="/admin" className="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-4">
                <Users size={24} className="text-cyan-400" />
                <span className="font-medium text-white">Administração</span>
              </div>
              <CaretRight size={20} className="text-gray-500" />
            </Link>
          )}

          {canManageUsers && (
            <Link to="/admin/history" className="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-4">
                <Clock size={24} className="text-cyan-400" />
                <span className="font-medium text-white">Histórico de Atividades</span>
              </div>
              <CaretRight size={20} className="text-gray-500" />
            </Link>
          )}

          <Link to="/configuracoes" className="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-4">
              <Gear size={24} className="text-cyan-400" />
              <span className="font-medium text-white">Configurações</span>
            </div>
            <CaretRight size={20} className="text-gray-500" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Power size={24} className="text-red-500" />
              <span className="font-medium text-red-400">Sair da Conta</span>
            </div>
            <CaretRight size={20} className="text-gray-500" />
          </button>
        </nav>
      </div>
    </div>
  );
}
