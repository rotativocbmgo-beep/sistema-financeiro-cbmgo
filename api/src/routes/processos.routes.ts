import { Router } from 'express';
import { ProcessoController } from '../controllers/ProcessoController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const processosRoutes = Router();
const processoController = new ProcessoController();

processosRoutes.use(ensureAuthenticated);

// Rotas para criar, listar e detalhar processos
processosRoutes.post('/', processoController.create); // Usado em "Novo Pagamento"
processosRoutes.get('/', processoController.list); // Usado na página "Processos"
processosRoutes.get('/:id', processoController.getById);
processosRoutes.patch('/:id/liquidar', processoController.liquidar);

// Rota para criar uma reposição (crédito)
processosRoutes.post('/reposicoes', processoController.createReposicao); // Usado em "Nova Reposição"

export default processosRoutes;
