import { BrowserRouter } from 'react-router-dom';
import { Router } from './Router';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast'; // 1. Importar o Toaster

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Router />
        {/* 2. Adicionar o componente Toaster aqui */}
        <Toaster
          position="top-right"
          toastOptions={{
            className: '',
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: 'green',
                secondary: 'white',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: 'red',
                secondary: 'white',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
