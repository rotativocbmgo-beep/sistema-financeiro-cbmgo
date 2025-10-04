// web/src/services/api.ts

import axios from 'axios';

// A URL base da API é lida diretamente das variáveis de ambiente do Vite.
// Isso garante que a configuração no arquivo .env ou .env.local seja a única fonte da verdade.
const apiUrl = import.meta.env.VITE_API_URL;

// Verifica se a variável de ambiente foi definida. Se não, lança um erro claro.
if (!apiUrl) {
  throw new Error("A variável de ambiente VITE_API_URL não está definida. Por favor, crie um arquivo .env na raiz do projeto 'web' e adicione a linha: VITE_API_URL=http://localhost:3333" );
}

export const api = axios.create({
  baseURL: apiUrl,
});

// Opcional, mas muito útil: Adiciona um log para confirmar a URL que está sendo usada durante o desenvolvimento.
console.log(`[INFO] A instância do serviço de API foi criada com a baseURL: ${apiUrl}`);
