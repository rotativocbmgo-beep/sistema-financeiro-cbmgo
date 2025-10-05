// web/src/components/Button.tsx

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner'; // 1. Importar o Spinner

// 2. Atualizar a interface para incluir as novas propriedades
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean; // A propriedade 'loading' agora é opcional
}

// 3. O nome do componente é alterado para seguir o padrão PascalCase
export function Button({ children, loading = false, ...props }: ButtonProps) {
  return (
    <button
      // 4. Desabilitar o botão quando estiver em estado de 'loading'
      disabled={loading || props.disabled}
      className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      {...props}
    >
      {/* 5. Renderizar o Spinner se 'loading' for true, caso contrário, renderizar o texto (children) */}
      {loading ? (
        <>
          <Spinner className="h-5 w-5" />
          <span>Salvando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// 6. Exportar como padrão para manter a consistência com outros componentes
export default Button;
