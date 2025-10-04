// api/src/routes/pagamentos.routes.ts

import { Router } from 'express';
// CORREÇÃO: Importações nomeadas com chaves {}
import { PagamentoController } from '../controllers/PagamentoController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const pagamentosRoutes = Router();
const pagamentoController = new PagamentoController();

pagamentosRoutes.use(ensureAuthenticated);
pagamentosRoutes.post('/', pagamentoController.create);

export default pagamentosRoutes;
