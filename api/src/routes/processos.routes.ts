// api/src/routes/processos.routes.ts

import { Router } from 'express';
import { ProcessoController } from '../controllers/ProcessoController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { checkPermission } from '../middlewares/checkPermission'; // Precisaremos disso

const processosRoutes = Router();
const processoController = new ProcessoController();

// Todas as rotas de processo exigem autenticação
processosRoutes.use(ensureAuthenticated);

// --- Definição das rotas com suas respectivas permissões ---

// Criar um novo processo (pagamento)
processosRoutes.post('/', checkPermission(['lancamento:criar:debito']), processoController.create);

// Listar processos do usuário
processosRoutes.get('/', checkPermission(['lancamento:listar']), processoController.list);

// Obter detalhes de um processo específico
processosRoutes.get('/:id', checkPermission(['lancamento:listar']), processoController.getById);

// Liquidar um processo
processosRoutes.patch('/:id/liquidar', checkPermission(['processo:liquidar']), processoController.liquidar);

// 1. Adicionar a nova rota de exclusão
processosRoutes.delete('/:id', checkPermission(['lancamento:excluir']), processoController.delete);

export default processosRoutes;
