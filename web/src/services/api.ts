import axios from 'axios';

export const api = axios.create({
  // CORREÇÃO: Adicionar o prefixo /api à URL base
  baseURL: 'http://localhost:3333/api',
} );
