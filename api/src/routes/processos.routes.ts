import { Router } from 'express';
import { ProcessoController } from '../controllers/ProcessoController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const processosRoutes = Router();
const processoController = new ProcessoController();

processosRoutes.use(ensureAuthenticated);

// Rotas para criar, listar e detalhar processos
processosRoutes.post('/', processoController.create);
processosRoutes.get('/', processoController.list);
processosRoutes.get('/:id', processoController.getById);
processosRoutes.patch('/:id/liquidar', processoController.liquidar);

// Rota DELETE adicionada
processosRoutes.delete('/:id', processoController.delete);

export default processosRoutes;
