import axios from 'axios';

// A URL base da API é lida diretamente das variáveis de ambiente do Vite.
// Isso garante que a configuração no arquivo .env seja a única fonte da verdade.
const apiUrl = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: apiUrl,
});

// Opcional: Adiciona um log para confirmar a URL que está sendo usada durante o desenvolvimento.
console.log(`[INFO] A instância do serviço de API foi criada com a baseURL: ${apiUrl}`);