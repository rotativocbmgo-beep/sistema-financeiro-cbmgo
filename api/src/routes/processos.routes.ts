import { Router } from 'express';
import { ProcessoController } from '../controllers/ProcessoController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const processosRoutes = Router();
const processoController = new ProcessoController();

// Aplica o middleware de autenticação para todas as rotas de processo
processosRoutes.use(ensureAuthenticated);

// --- Rotas para Processos ---
processosRoutes.post('/', processoController.create);
processosRoutes.get('/', processoController.list);
processosRoutes.get('/:id', processoController.getById);
processosRoutes.patch('/:id/liquidar', processoController.liquidar);

// --- Rotas para Lançamentos (Reposições, etc.) ---
// (Note que a criação de reposição está em seu próprio método no controller)
processosRoutes.post('/reposicoes', processoController.createReposicao); 
processosRoutes.get('/lancamentos', processoController.listLancamentos);
processosRoutes.put('/lancamentos/:id', processoController.update);
processosRoutes.delete('/lancamentos/:id', processoController.delete);

// --- Rotas para Exportação ---
processosRoutes.get('/export/csv', processoController.exportCSV);
processosRoutes.get('/export/pdf', processoController.exportPDF);

// AS ROTAS DE DASHBOARD (COMO /saldo) FORAM REMOVIDAS DAQUI
// PORQUE AGORA ESTÃO EM dashboard.routes.ts

export default processosRoutes;
