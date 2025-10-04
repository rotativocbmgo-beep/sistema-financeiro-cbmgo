import { FormEvent, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import { Bank } from '@phosphor-icons/react';
import toast from 'react-hot-toast'; // <-- ADICIONAR ESTA LINHA

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    console.log("--- DIAGNÓSTICO DE API ---");
    if (apiUrl) {
      console.log(`[INFO] A variável VITE_API_URL está definida como: ${apiUrl}`);
    } else {
      console.error("[ERRO] A variável de ambiente VITE_API_URL não está definida!");
    }
    console.log("--------------------------");
  }, []);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, preencha e-mail e senha.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Erro de login:', error);
      toast.error('Falha no login. Verifique suas credenciais.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <header className="text-center mb-8">
          <Bank size={48} className="mx-auto text-cyan-400 mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400">CBMGO Financeiro</h1>
          <p className="text-gray-400 mt-2">Acesse sua conta para continuar</p>
        </header>
        <main>
          <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-lg shadow-lg">
            <div className="space-y-6">
              <Input
                label="E-mail"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label="Senha"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
