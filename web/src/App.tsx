import { BrowserRouter } from 'react-router-dom';
import { Router } from './Router';
import { AuthProvider } from './contexts/AuthContext';
import { LayoutProvider } from './contexts/LayoutContext'; // 1. Importar
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* 2. Envolver o Router com o LayoutProvider */}
        <LayoutProvider>
          <Router />
        </LayoutProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            // ... suas opções de toast
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
