// web/src/App.tsx

import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Router } from './Router';
import { AuthProvider } from './contexts/AuthContext';
import { LayoutProvider } from './contexts/LayoutContext';

// Obtém o Client ID aqui
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  throw new Error("A variável de ambiente VITE_GOOGLE_CLIENT_ID não está definida. Por favor, adicione-a ao seu arquivo .env na pasta 'web'.");
}

export function App() { 
  return (
    // O BrowserRouter DEVE estar aqui, envolvendo todos os outros providers e o Router
    <BrowserRouter>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <LayoutProvider>
            <Router />
          </LayoutProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </BrowserRouter>
  );
}
