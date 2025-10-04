import { useState, ReactNode } from 'react';
import { Link } from 'react-router-dom'; // <-- ADICIONAR ESTA LINHA
import { Sidebar } from './Sidebar';
import { List, X } from '@phosphor-icons/react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r border-gray-700 bg-gray-900 lg:block">
        <Sidebar />
      </div>

      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-gray-700 bg-gray-900 px-6 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-300 hover:text-white"
            aria-label="Abrir menu"
          >
            <List size={24} />
          </button>
          <Link to="/" className="flex items-center gap-2 font-semibold text-white">
            <span>CBMGO Financeiro</span>
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-800 overflow-y-auto">
          {children}
        </main>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-black/60" 
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          ></div>
          
          <div className="relative flex flex-col w-72 max-w-[calc(100vw-3rem)] bg-gray-900">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-white"
                aria-label="Fechar menu"
              >
                <X size={24} />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  );
}
