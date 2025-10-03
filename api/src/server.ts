import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import mainRouter from './routes/index'; // Importar o roteador principal

export const prisma = new PrismaClient({
  log: ['query'],
});

const app = express();

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  return res.json({
    message: 'API do Sistema Financeiro CBMGO no ar!',
  });
});

// Usar o roteador principal com o prefixo /api
app.use('/api', mainRouter);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}` );
});
