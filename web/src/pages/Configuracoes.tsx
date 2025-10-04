import { FormEvent, useEffect, useState, ChangeEvent } from "react";
import { api } from "../services/api";
import toast from "react-hot-toast";
import Input from "../components/Input";

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
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get('/settings')
      .then(response => {
        setSettings(response.data);
        if (response.data.logoUrl) {
          setLogoPreview(response.data.logoUrl);
        }
      })
      .catch(err => {
        console.error("Erro ao buscar configurações:", err);
        toast.error("Não foi possível carregar as configurações.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  async function handleUpdateSettings(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    
    const updateToastId = 'update-settings';
    toast.loading('Salvando alterações...', { id: updateToastId });

    try {
      const textResponse = await api.put('/settings', {
        companyName: settings.companyName,
        cnpj: settings.cnpj,
        address: settings.address,
      });
      
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        
        const logoResponse = await api.patch('/settings/logo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setSettings(logoResponse.data);
        setLogoPreview(logoResponse.data.logoUrl);
        setLogoFile(null);
      } else {
        setSettings(textResponse.data);
      }

      toast.success('Configurações salvas com sucesso!', { id: updateToastId });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error('Falha ao salvar as alterações.', { id: updateToastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center p-8">Carregando configurações...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-400">Configurações da Conta</h1>
        <p className="text-gray-400">Personalize as informações que aparecerão nos seus relatórios.</p>
      </header>

      <main>
        {/* CORREÇÃO: Adicionada a classe 'text-gray-300' ao formulário para definir a cor padrão do texto */}
        <form onSubmit={handleUpdateSettings} className="bg-gray-900 p-6 sm:p-8 rounded-lg shadow-lg text-gray-300">
          {/* Título da seção com cor mais forte para destaque */}
          <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-4 text-white">Informações da Empresa</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input label="Nome da Empresa/Órgão" id="companyName" name="companyName" type="text" value={settings.companyName || ''} onChange={handleInputChange} />
            </div>
            <Input label="CNPJ" id="cnpj" name="cnpj" type="text" placeholder="00.000.000/0001-00" value={settings.cnpj || ''} onChange={handleInputChange} />
            <div className="md:col-span-2">
              <Input label="Endereço" id="address" name="address" type="text" placeholder="Rua, Número, Bairro, Cidade - Estado, CEP" value={settings.address || ''} onChange={handleInputChange} />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
             {/* Título da seção com cor mais forte para destaque */}
             <h2 className="text-xl font-bold mb-4 text-white">Logotipo</h2>
             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-gray-800 rounded-lg">
                <img 
                    src={logoPreview || 'https://placehold.jp/150x150.png?text=Logo'} 
                    alt="Logo preview"
                    className="w-24 h-24 rounded-md object-cover bg-gray-700"
                />
                <div>
                    <label htmlFor="logo-upload" className="inline-block bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg text-sm cursor-pointer">
                        Escolher arquivo
                    </label>
                    <input id="logo-upload" type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleLogoChange} />
                    <p className="text-gray-400 text-xs mt-2">Envie um arquivo PNG ou JPG (tamanho máx. 2MB ).</p>
                </div>
             </div>
          </div>

          <div className="mt-8 text-right">
            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50">
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </main>
    </div>
    );
}
