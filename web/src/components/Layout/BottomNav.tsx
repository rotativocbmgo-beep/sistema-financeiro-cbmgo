// web/src/components/Layout/BottomNav.tsx

import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
// CORREÇÃO APLICADA AQUI: Removido o 'Gear' e adicionado 'UserCircle' corretamente.
import { ChartBar, Files, UserCircle, Plus, X, ArrowUp, ArrowDown } from "@phosphor-icons/react";

export function BottomNav() {
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  const navLinkClass = "flex flex-col items-center gap-1 text-gray-400 hover:text-cyan-400 transition-colors w-1/5";
  const activeNavLinkClass = "!text-cyan-400";

  const handleFabClick = () => {
    setIsFabMenuOpen(prev => !prev);
  };

  const closeFabMenu = () => {
    setIsFabMenuOpen(false);
  };

  return (
    <>
      {/* Overlay escuro quando o menu FAB está aberto */}
      {isFabMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={closeFabMenu}
          aria-hidden="true"
        />
      )}

      {/* Menu de Ações Flutuante (Speed Dial) */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
        {isFabMenuOpen && (
          <div className="flex flex-col items-center gap-3 transition-all duration-300">
            <Link
              to="/reposicoes/nova"
              onClick={closeFabMenu}
              className="flex items-center gap-2 rounded-full bg-yellow-500 py-2 px-4 text-sm font-bold text-black shadow-lg hover:bg-yellow-600 w-48 justify-center"
            >
              <ArrowUp size={16} weight="bold" /> Nova Reposição
            </Link>
            <Link
              to="/pagamentos/novo"
              onClick={closeFabMenu}
              className="flex items-center gap-2 rounded-full bg-cyan-500 py-2 px-4 text-sm font-bold text-white shadow-lg hover:bg-cyan-600 w-48 justify-center"
            >
              <ArrowDown size={16} weight="bold" /> Novo Pagamento
            </Link>
          </div>
        )}
      </div>

      {/* Barra de Navegação Principal */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-700 bg-gray-900">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}
        >
          <ChartBar size={24} />
          <span className="text-xs">Gráficos</span>
        </NavLink>
        <NavLink
          to="/extrato"
          className={({ isActive }) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}
        >
          <Files size={24} />
          <span className="text-xs">Extrato</span>
        </NavLink>

        {/* Botão de Ação Central (FAB) */}
        <div className="w-1/5 flex justify-center">
            <button
                onClick={handleFabClick}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-xl transition-all duration-300 hover:bg-purple-700 active:scale-95 -mt-8 border-4 border-gray-900"
                aria-label={isFabMenuOpen ? "Fechar menu de ações" : "Abrir menu de ações"}
            >
                <Plus size={28} className={`absolute transition-transform duration-300 ${isFabMenuOpen ? 'rotate-45 scale-0' : 'rotate-0 scale-100'}`} />
                <X size={28} className={`absolute transition-transform duration-300 ${isFabMenuOpen ? 'rotate-0 scale-100' : '-rotate-45 scale-0'}`} />
            </button>
        </div>

        <NavLink
          to="/processos"
          className={({ isActive }) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}
        >
          <Files size={24} />
          <span className="text-xs">Processos</span>
        </NavLink>
        <NavLink
          to="/conta"
          className={({ isActive }) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}
        >
          <UserCircle size={24} />
          <span className="text-xs">Conta</span>
        </NavLink>
      </nav>
    </>
  );
}
