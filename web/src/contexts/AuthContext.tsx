// web/src/contexts/AuthContext.tsx

import { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../services/api';

// --- Interfaces ---
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  login(credentials: LoginCredentials): Promise<void>;
  loginWithGoogle(code: string): Promise<void>; // <-- NOVA FUNÇÃO
  logout(): void;
  loading: boolean;
}

// --- Contexto ---
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// --- Provider ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@CbmgoFinanceiro:token');
    const user = localStorage.getItem('@CbmgoFinanceiro:user');

    if (token && user) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;
      return { token, user: JSON.parse(user) };
    }
    return { token: null, user: null };
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await api.post('/sessions', credentials);
    const { user, token } = response.data;

    localStorage.setItem('@CbmgoFinanceiro:token', token);
    localStorage.setItem('@CbmgoFinanceiro:user', JSON.stringify(user));
    api.defaults.headers.common.authorization = `Bearer ${token}`;
    setData({ user, token });
  }, []);

  // --- NOVA FUNÇÃO DE LOGIN COM GOOGLE ---
  const loginWithGoogle = useCallback(async (code: string) => {
    const response = await api.post('/auth/google/callback', { code });
    const { user, token } = response.data;

    localStorage.setItem('@CbmgoFinanceiro:token', token);
    localStorage.setItem('@CbmgoFinanceiro:user', JSON.stringify(user));
    api.defaults.headers.common.authorization = `Bearer ${token}`;
    setData({ user, token });
  }, []);


  const logout = useCallback(() => {
    localStorage.removeItem('@CbmgoFinanceiro:token');
    localStorage.removeItem('@CbmgoFinanceiro:user');
    delete api.defaults.headers.common.authorization;
    setData({ user: null, token: null });
  }, []);

  return (
    <AuthContext.Provider value={{ user: data.user, token: data.token, login, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Hook ---
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
