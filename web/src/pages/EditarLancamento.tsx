// web/src/pages/EditarLancamento.tsx

// 1. A importação de 'Link' foi removida desta linha
import { useParams } from "react-router-dom"; 
import { useLancamento } from "../hooks/useLancamento";
import Input from "../components/Input";
import { Skeleton } from "../components/Skeleton";
import Button from "../components/Button";

export function EditarLancamento() {
  const { id } = useParams<{ id: string }>();
  
  const {
    formData,
    setFormData,
    loading,
    isSubmitting,
    handleUpdateLancamento,
  } = useLancamento(id);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-4 w-3/4 mb-8" />
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="text-right">
            <Skeleton className="h-12 w-32 ml-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-400">Editar Lançamento</h1>
        <p className="text-gray-400">Ajuste os dados do lançamento manual selecionado.</p>
      </header>

      <main>
        <form onSubmit={handleUpdateLancamento} className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
          <div className="space-y-6">
            <Input 
              label="Histórico*" 
              id="historico" 
              name="historico"
              type="text" 
              value={formData.historico} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Data do Lançamento*" 
              id="data" 
              name="data"
              type="date" 
              value={formData.data} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Valor (R$)*" 
              id="valor" 
              name="valor"
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              value={formData.valor} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className="mt-8 text-right">
            <Button type="submit" loading={isSubmitting}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
