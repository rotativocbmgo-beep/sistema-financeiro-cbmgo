// src/components/Layout/BottomNav.tsx

import { NavLink } from "react-router-dom";
import { ChartBar, Files, Gear } from "@phosphor-icons/react";

export function BottomNav() {
  const navLinkClass = "flex flex-col items-center gap-1 text-gray-400 hover:text-cyan-400 transition-colors";
  const activeNavLinkClass = "!text-cyan-400"; // Usamos ! para forçar a prioridade

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-gray-700 bg-gray-900">
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
      <NavLink 
        to="/processos" 
        className={({ isActive }) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}
      >
        <Files size={24} />
        <span className="text-xs">Processos</span>
      </NavLink>
      <NavLink 
        to="/configuracoes" 
        className={({ isActive }) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}
      >
        <Gear size={24} />
        <span className="text-xs">Ajustes</span>
      </NavLink>
    </nav>
  );
}
