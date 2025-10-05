// web/src/components/Spinner.tsx

import { SVGProps } from 'react';

// A interface define que o componente aceita todas as propriedades de um SVG
interface SpinnerProps extends SVGProps<SVGSVGElement> {}

// O componente Spinner renderiza um ícone de círculo giratório
export function Spinner(props: SpinnerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      // A animação 'animate-spin' do TailwindCSS faz o ícone girar
      className="animate-spin"
      {...props} // Permite passar outras props como 'className' para customização
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
   );
}
