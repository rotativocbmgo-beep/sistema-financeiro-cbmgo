// web/src/components/Layout/MainLayout.tsx

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useLayout } from '../../contexts/LayoutContext';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { pageTitle } = useLayout();

  return (
    <div className="grid h-screen w-full overflow-hidden md:grid-cols-[280px_1fr]">
      {/* --- Sidebar para Desktop (Fixo) --- */}
      <div className="hidden border-r border-gray-700 bg-gray-900 md:block">
        <Sidebar />
      </div>

      {/* 
        ======================================================================
        == CORREÇÃO APLICADA AQUI ==
        ======================================================================
        Este 'div' agora é um container flexível que organiza o cabeçalho e o 
        conteúdo principal verticalmente, ocupando toda a altura disponível.
      */}
      <div className="flex h-screen flex-col">
        
        {/* --- CABEÇALHO (Fixo no Topo) --- */}
        {/* Este header agora está fora da área de scroll e tem altura fixa. */}
        <header className="flex h-16 flex-shrink-0 items-center border-b border-gray-700 bg-gray-900 px-6">
          <h1 className="text-xl font-semibold text-gray-200">{pageTitle}</h1>
        </header>

        {/* --- CONTEÚDO PRINCIPAL (Área de Scroll) --- */}
        {/* 
          'flex-1' faz com que ele ocupe todo o espaço restante.
          'overflow-y-auto' garante que APENAS esta área tenha barra de rolagem.
        */}
        <main className="flex-1 overflow-y-auto bg-gray-800 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* --- Barra de Navegação Inferior para Mobile (Fixa) --- */}
      {/* A navegação mobile não é afetada por esta mudança. */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
