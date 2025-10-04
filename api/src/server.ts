// api/src/server.ts

import 'dotenv/config';
import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client'; // 1. Importe o PrismaClient
import router from './routes';
import { AppError } from './errors/AppError';

const app = express();

export const prisma = new PrismaClient(); // 2. CRIE E EXPORTE a instância do prisma

app.use(cors());
app.use(express.json());
app.use(router);

// ... (o resto do seu arquivo continua igual) ...
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
