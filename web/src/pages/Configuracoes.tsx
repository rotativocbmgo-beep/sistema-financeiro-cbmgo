import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import toast from "react-hot-toast";
import Input from "../components/Input"; // Reutilizando nosso componente de Input

// Interface para tipar os dados das configurações
interface UserSettings {
  companyName: string;
  cnpj: string;
  address: string;
  logoUrl: string;
}

export function Configuracoes() {
  const [settings, setSettings] = useState<Partial<UserSettings>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efeito para buscar os dados quando o componente é montado
  useEffect(() => {
    setLoading(true);
    api.get('/settings')
      .then(response => {
        setSettings(response.data);
      })
      .catch(err => {
        console.error("Erro ao buscar configurações:", err);
        toast.error("Não foi possível carregar as configurações.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Função para lidar com a atualização dos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Função para enviar o formulário
  async function handleUpdateSettings(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    toast.loading('Salvando alterações...', { id: 'update-settings' });

    try {
      const response = await api.put('/settings', {
        companyName: settings.companyName,
        cnpj: settings.cnpj,
        address: settings.address,
      });
      setSettings(response.data); // Atualiza o estado com os dados retornados
      toast.success('Configurações salvas com sucesso!', { id: 'update-settings' });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error('Falha ao salvar as alterações.', { id: 'update-settings' });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-800 text-white p-8 text-center">Carregando configurações...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white p-8">
      <header className="mb-8 flex justify-between items-center max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-purple-400">Configurações da Conta</h1>
          <p className="text-gray-400">Personalize as informações que aparecerão nos seus relatórios.</p>
        </div>
        <Link to="/" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          &larr; Voltar ao Dashboard
        </Link>
      </header>

      <main className="max-w-4xl mx-auto">
        <form onSubmit={handleUpdateSettings} className="bg-gray-900 p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-4">Informações da Empresa</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Nome da Empresa/Órgão"
                id="companyName"
                name="companyName"
                type="text"
                value={settings.companyName || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <Input
              label="CNPJ"
              id="cnpj"
              name="cnpj"
              type="text"
              placeholder="00.000.000/0001-00"
              value={settings.cnpj || ''}
              onChange={handleInputChange}
            />
            
            <div className="md:col-span-2">
              <Input
                label="Endereço"
                id="address"
                name="address"
                type="text"
                placeholder="Rua, Número, Bairro, Cidade - Estado, CEP"
                value={settings.address || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Área para o upload do logo (a ser implementada) */}
          <div className="mt-8 pt-6 border-t border-gray-700">
             <h2 className="text-xl font-bold mb-4">Logotipo</h2>
             <div className="flex items-center gap-6 p-4 bg-gray-800 rounded-lg">
                <img 
                    src={settings.logoUrl || 'https://placehold.jp/150x150.png?text=Logo'} 
                    alt="Logo preview"
                    className="w-24 h-24 rounded-md object-cover bg-gray-700"
                />
                <div>
                    <p className="text-gray-400 text-sm mb-2">A funcionalidade de upload será implementada em breve.</p>
                    <button type="button" className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm cursor-not-allowed opacity-50">
                        Escolher arquivo
                    </button>
                </div>
             </div>
          </div>

          <div className="mt-8 text-right">
            <button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50">
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </main>
    </div>
   );
}
// ...