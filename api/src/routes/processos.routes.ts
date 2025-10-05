// api/src/routes/processos.routes.ts

import { Router } from 'express';
import multer from 'multer'; // 1. Importar o multer
import uploadConfig from '../config/upload'; // 2. Importar nossa configuração de upload
import { ProcessoController } from '../controllers/ProcessoController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { checkPermission } from '../middlewares/checkPermission';

const processosRoutes = Router();
const processoController = new ProcessoController();
const upload = multer(uploadConfig); // 3. Criar uma instância do multer com nossa config

// Todas as rotas de processo exigem autenticação
processosRoutes.use(ensureAuthenticated);

// --- Definição das rotas com suas respectivas permissões ---

// 4. A rota de criação (POST) agora usa o middleware 'upload.single()'
// O argumento 'comprovante' deve ser o mesmo nome do campo que enviaremos do frontend.
processosRoutes.post(
  '/',
  checkPermission(['lancamento:criar:debito']),
  upload.single('comprovante'), // <-- MIDDLEWARE DE UPLOAD ADICIONADO AQUI
  processoController.create
);

// Listar processos do usuário
processosRoutes.get('/', checkPermission(['lancamento:listar']), processoController.list);

// Obter detalhes de um processo específico
processosRoutes.get('/:id', checkPermission(['lancamento:listar']), processoController.getById);

// Liquidar um processo
processosRoutes.patch('/:id/liquidar', checkPermission(['processo:liquidar']), processoController.liquidar);

// Excluir um processo
processosRoutes.delete('/:id', checkPermission(['lancamento:excluir']), processoController.delete);

export default processosRoutes;
