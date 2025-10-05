import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { checkPermission } from '../middlewares/checkPermission';

const adminRoutes = Router();
const adminController = new AdminController();

// Todas as rotas de admin exigem autenticação
adminRoutes.use(ensureAuthenticated);

// Apenas usuários com a permissão 'usuario:gerenciar' podem acessar estas rotas
const adminPermission = ['usuario:gerenciar'];

adminRoutes.get('/users', checkPermission(adminPermission), adminController.listUsers);
adminRoutes.patch('/users/:userId/approve', checkPermission(adminPermission), adminController.approveUser);
adminRoutes.patch('/users/:userId/reject', checkPermission(adminPermission), adminController.rejectUser);
adminRoutes.put('/users/:userId/permissions', checkPermission(adminPermission), adminController.updateUserPermissions);

// --- NOVA ROTA ---
// Rota para o frontend buscar a lista de permissões disponíveis
adminRoutes.get('/permissions', checkPermission(adminPermission), adminController.listAllPermissions);

export default adminRoutes;
