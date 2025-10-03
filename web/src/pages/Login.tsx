import { FormEvent, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import { Link } from 'react-router-dom'; // 1. Importar o Link

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    if (!email || !password) {
      alert('Por favor, preencha e-mail e senha.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
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
          {/* 2. Adicionar o link para a página de registro */}
          <div className="text-center mt-6">
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Não tem uma conta? Cadastre-se
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
