// api/src/server.ts

import 'dotenv/config';
import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import router from './routes';
import { AppError } from './errors/AppError';
import uploadConfig from './config/upload';

const app = express();

export const prisma = new PrismaClient();

// --- LÓGICA DE CORS ATUALIZADA E ROBUSTA ---

// 1. Define a origem de produção principal a partir das variáveis de ambiente.
//    Isso torna o código mais flexível se a URL do frontend mudar no futuro.
const productionOrigin = process.env.CORS_ORIGIN || 'https://sistema-financeiro-cbmgo.vercel.app';

// 2. Inicia a lista de origens permitidas com a URL de produção.
const allowedOrigins = [productionOrigin];

// 3. Em ambiente de desenvolvimento (ou qualquer ambiente que não seja 'production' ),
//    adiciona as URLs locais à lista para permitir testes.
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173' ); // Frontend local (Vite dev)
  allowedOrigins.push('http://localhost:5174' ); // Frontend local (Vite preview)
}

// 4. Configura o middleware do CORS de forma dinâmica.
app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (ex: Postman, Insomnia, apps mobile).
    if (!origin) {
      return callback(null, true);
    }

    // Se a origem da requisição estiver na nossa lista de permitidas, autoriza.
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      // Se não estiver, rejeita a requisição com um erro específico de CORS.
      return callback(new Error('A política de CORS para este site não permite acesso da origem especificada.'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// Middleware para servir arquivos estáticos da pasta 'uploads'
app.use('/files', express.static(uploadConfig.directory));

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Registra todas as rotas da aplicação
app.use(router);

// Middleware para tratamento de erros global
app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Log do erro no console do servidor para depuração
  console.error(err);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

// Inicialização do servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}!`);
  // Logs para facilitar a depuração do CORS no deploy
  console.log(`[CORS] Ambiente (NODE_ENV): ${process.env.NODE_ENV || 'development'}`);
  console.log('[CORS] Origens permitidas:', allowedOrigins);
});
