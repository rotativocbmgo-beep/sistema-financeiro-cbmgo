import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { checkPermission } from '../middlewares/checkPermission';

const reportsRoutes = Router();
const reportController = new ReportController();

// Todas as rotas de relatório exigem que o usuário esteja autenticado
reportsRoutes.use(ensureAuthenticated);

// --- Rotas e suas permissões ---

// Listar e visualizar relatórios
reportsRoutes.get('/', checkPermission(['relatorio:visualizar']), reportController.list);
reportsRoutes.get('/:id', checkPermission(['relatorio:visualizar']), reportController.getById);

// Criar, editar e finalizar relatórios
reportsRoutes.post('/', checkPermission(['relatorio:criar']), reportController.create);
reportsRoutes.put('/:id', checkPermission(['relatorio:criar']), reportController.update);
reportsRoutes.patch('/:id/finalize', checkPermission(['relatorio:criar']), reportController.finalize);
reportsRoutes.delete('/:id', checkPermission(['relatorio:criar']), reportController.delete);

// Rota de Assinatura
reportsRoutes.post('/:id/sign', checkPermission(['relatorio:assinar']), reportController.signReport);

// Rota de Exportação
reportsRoutes.get('/:id/export', checkPermission(['relatorio:exportar']), reportController.exportPDF);

export default reportsRoutes;
