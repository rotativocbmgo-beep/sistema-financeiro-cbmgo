// api/src/server.ts

import 'dotenv/config';
import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors'; // 1. O import já existe
import { PrismaClient } from '@prisma/client';
import router from './routes';
import { AppError } from './errors/AppError';

const app = express();

export const prisma = new PrismaClient();

// 2. Definir as opções do CORS
const corsOptions = {
  // A origem permitida é a URL do seu frontend na Vercel.
  // É crucial que não haja uma barra "/" no final da URL.
  origin: 'https://sistema-financeiro-cbmgo.vercel.app', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Permitir todos os métodos HTTP necessários
  credentials: true, // Permitir o envio de cookies e cabeçalhos de autorização
  optionsSuccessStatus: 204
};

// 3. Aplicar o middleware do CORS com as opções configuradas
app.use(cors(corsOptions ));

// Habilitar o Express para entender requisições preflight (OPTIONS)
// Isso é essencial para que o CORS funcione com requisições complexas.
app.options('*', cors(corsOptions));

app.use(express.json());

// Adiciona uma rota para servir os arquivos da pasta 'uploads'
app.use('/files', express.static('uploads'));

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
});
