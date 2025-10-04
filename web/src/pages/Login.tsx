import { FormEvent, useState, useEffect } from 'react'; // 1. Adicionar useEffect
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  // --- CÓDIGO DE DIAGNÓSTICO ---
  // Este bloco irá logar a URL da API que o frontend está tentando usar.
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    console.log("--- DIAGNÓSTICO DE API ---");
    if (apiUrl) {
      console.log(`[INFO] A variável VITE_API_URL está definida como: ${apiUrl}`);
    } else {
      console.error("[ERRO] A variável de ambiente VITE_API_URL não está definida!");
      console.log("[INFO] O frontend tentará usar a URL base do próprio site para as requisições, o que causará falhas em produção.");
    }
    console.log("--------------------------");
  }, []);
  // --- FIM DO CÓDIGO DE DIAGNÓSTICO ---

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    if (!email || !password) {
      alert('Por favor, preencha e-mail e senha.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      // O redirecionamento será tratado pelo Router
    } catch (error) {
      console.error('Erro de login:', error);
      alert('Falha no login. Verifique suas credenciais.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">CBMGO Financeiro</h1>
          <p className="text-gray-400">Acesse sua conta para continuar</p>
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
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
