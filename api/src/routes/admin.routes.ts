// api/src/routes/admin.routes.ts

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

// --- NOVA ROTA ADICIONADA ---
// Rota para buscar um usuário por ID (deve vir antes da rota geral /users para não haver conflito)
adminRoutes.get('/users/:userId', checkPermission(adminPermission), adminController.getUserById);

// Rotas existentes
adminRoutes.get('/users', checkPermission(adminPermission), adminController.listUsers);
adminRoutes.patch('/users/:userId/approve', checkPermission(adminPermission), adminController.approveUser);
adminRoutes.patch('/users/:userId/reject', checkPermission(adminPermission), adminController.rejectUser);
adminRoutes.put('/users/:userId/permissions', checkPermission(adminPermission), adminController.updateUserPermissions);
adminRoutes.get('/permissions', checkPermission(adminPermission), adminController.listAllPermissions);

export default adminRoutes;
