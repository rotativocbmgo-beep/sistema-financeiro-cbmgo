// web/src/pages/Login.tsx

import { FormEvent, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import { Bank } from '@phosphor-icons/react';
// --- CORREÇÃO APLICADA AQUI ---
// Use chaves {} para uma importação nomeada
import { GoogleLogo } from '../components/GoogleLogo';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, preencha e-mail e senha.');
      return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading('Entrando...');
    try {
      await login({ email, password });
      toast.success('Login realizado com sucesso!', { id: toastId });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Falha no login. Verifique suas credenciais.';
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true);
      const toastId = toast.loading('Autenticando com Google...');
      try {
        await loginWithGoogle(tokenResponse.code);
        toast.success('Login com Google realizado com sucesso!', { id: toastId });
      } catch (error: any) {
        const message = error.response?.data?.error || 'Falha na autenticação com o Google.';
        toast.error(message, { id: toastId });
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => {
      toast.error('Não foi possível autenticar com o Google.');
    },
    flow: 'auth-code',
  });

  return (
    <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <header className="text-center mb-8">
          <Bank size={48} className="mx-auto text-cyan-400 mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400">CBMGO Financeiro</h1>
          <p className="text-gray-400 mt-2">Acesse sua conta para continuar</p>
        </header>
        <main>
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <GoogleLogo className="w-6 h-6" />
              Entrar com Google
            </button>

            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">OU</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <Input label="E-mail" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                <Input label="Senha" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              <div className="mt-8">
                <button type="submit" disabled={isSubmitting} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Entrando...' : 'Entrar com E-mail'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
