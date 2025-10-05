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
    <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
      {/* --- Sidebar para Desktop --- */}
      <div className="hidden border-r border-gray-700 bg-gray-900 md:block">
        <Sidebar />
      </div>

      <div className="flex flex-col">
        {/* --- CABEÇALHO PARA MOBILE (NOVO) --- */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-center border-b border-gray-700 bg-gray-900 px-4 md:hidden">
          <h1 className="text-lg font-semibold text-gray-200">{pageTitle}</h1>
        </header>

        {/* --- Cabeçalho para Desktop --- */}
        <header className="hidden h-16 items-center border-b border-gray-700 bg-gray-900 px-6 md:flex">
          <h1 className="text-xl font-semibold text-gray-200">{pageTitle}</h1>
        </header>

        {/* --- Conteúdo Principal --- */}
        {/* Adicionado padding-top para evitar que o conteúdo comece sob o cabeçalho móvel */}
        <main className="flex-1 overflow-y-auto bg-gray-800 p-4 pb-24 md:pt-6 sm:p-6 md:pb-8 lg:p-8">
          {children}
        </main>
      </div>

      {/* --- Barra de Navegação Inferior para Mobile --- */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
