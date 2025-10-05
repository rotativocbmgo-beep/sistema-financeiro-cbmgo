// api/src/server.ts

import 'dotenv/config';
import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path'; // Importar o 'path' do Node.js
import { PrismaClient } from '@prisma/client';
import router from './routes';
import { AppError } from './errors/AppError';
import uploadConfig from './config/upload';

const app = express( );

export const prisma = new PrismaClient();

// --- LÓGICA DE CORS ATUALIZADA ---

// 1. Define as origens permitidas
const allowedOrigins = [
  'https://sistema-financeiro-cbmgo.vercel.app', // Frontend em produção
];

// 2. Em ambiente de desenvolvimento, adiciona as URLs locais à lista
if (process.env.NODE_ENV !== 'production' ) {
  allowedOrigins.push('http://localhost:5173' ); // Frontend local (Vite)
  allowedOrigins.push('http://localhost:5174' ); // Frontend local (Preview do Vite)
}

// 3. Configura o middleware do CORS
app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (como Postman, Insomnia, ou apps mobile)
    if (!origin) return callback(null, true);

    // Se a origem da requisição estiver na nossa lista, permite
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      // Se não estiver, rejeita com um erro de CORS
      return callback(new Error('A política de CORS para este site não permite acesso da origem especificada.'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));


app.use(express.json());

// Rota para servir arquivos de upload
app.use('/files', express.static(uploadConfig.directory));

app.use(router);

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  console.error(err);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}!`);
  // Log para confirmar o ambiente
  console.log(`[CORS] Rodando em modo: ${process.env.NODE_ENV || 'development'}`);
  console.log('[CORS] Origens permitidas:', allowedOrigins);
});
