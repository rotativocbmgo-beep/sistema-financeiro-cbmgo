import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Input from '../components/Input';

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    if (!name || !email || !password) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Usando a rota POST /api/users que já criamos no backend
      await api.post('/users', { name, email, password });

      alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
      navigate('/login'); // Redireciona para o login após o sucesso
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      const errorMessage = error.response?.data?.error || 'Falha ao realizar o cadastro. Tente novamente.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">Criar Nova Conta</h1>
          <p className="text-gray-400">Junte-se à plataforma de controle financeiro.</p>
        </header>
        <main>
          <form onSubmit={handleRegister} className="bg-gray-900 p-8 rounded-lg shadow-lg">
            <div className="space-y-6">
              <Input
                label="Nome Completo"
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="E-mail"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Senha"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Cadastrando...' : 'Criar Conta'}
              </button>
            </div>
          </form>
          <div className="text-center mt-6">
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Já tem uma conta? Faça login
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
