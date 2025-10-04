import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useLayout } from '../../contexts/LayoutContext';
import { Plus, X } from '@phosphor-icons/react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { pageTitle } = useLayout();
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
      {/* --- Sidebar para Desktop --- */}
      {/* CORREÇÃO: Adicionadas as classes de borda vertical aqui */}
      <div className="hidden border-r border-gray-700 bg-gray-900 md:block">
        <Sidebar />
      </div>

      <div className="flex flex-col">
        {/* --- Cabeçalho para Desktop --- */}
        <header className="hidden h-16 items-center border-b border-gray-700 bg-gray-900 px-6 md:flex">
          <h1 className="text-xl font-semibold text-gray-200">{pageTitle}</h1>
        </header>

        {/* --- Conteúdo Principal --- */}
        <main className="flex-1 overflow-y-auto bg-gray-800 p-4 pb-24 sm:p-6 md:pb-8 lg:p-8">
          {children}
        </main>
      </div>

      {/* --- Barra de Navegação Inferior para Mobile --- */}
      <div className="md:hidden">
        <BottomNav />

        {/* Menu de Ação Flutuante (FAB) */}
        <div className="fixed bottom-20 right-4 z-50">
          {isFabMenuOpen && (
            <div className="mb-4 flex flex-col items-end gap-3">
              <Link to="/reposicoes/nova" onClick={() => setIsFabMenuOpen(false)} className="flex items-center gap-2 rounded-full bg-yellow-500 py-2 px-4 text-sm font-bold text-black shadow-lg hover:bg-yellow-600">
                + Nova Reposição
              </Link>
              <Link to="/pagamentos/novo" onClick={() => setIsFabMenuOpen(false)} className="flex items-center gap-2 rounded-full bg-cyan-500 py-2 px-4 text-sm font-bold text-white shadow-lg hover:bg-cyan-600">
                + Novo Pagamento
              </Link>
            </div>
          )}
          <button
            onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-xl transition-transform duration-300 hover:bg-purple-700 active:scale-95"
            aria-label="Abrir menu de ações"
          >
            <Plus size={28} className={`absolute transition-all duration-300 ${isFabMenuOpen ? 'rotate-45 scale-0' : 'rotate-0 scale-100'}`} />
            <X size={28} className={`absolute transition-all duration-300 ${isFabMenuOpen ? 'rotate-0 scale-100' : '-rotate-45 scale-0'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
