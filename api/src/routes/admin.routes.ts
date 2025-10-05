// api/src/routes/admin.routes.ts

import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { checkPermission } from '../middlewares/checkPermission';

const adminRoutes = Router();
const adminController = new AdminController();

adminRoutes.use(ensureAuthenticated);

const adminPermission = ['usuario:gerenciar'];

// Rota para o histórico de atividades global
adminRoutes.get('/activity-logs', checkPermission(adminPermission), adminController.listAllActivities);

// Outras rotas de admin
adminRoutes.post('/users/bulk-action', checkPermission(adminPermission), adminController.bulkAction);
adminRoutes.get('/users/:userId', checkPermission(adminPermission), adminController.getUserById);
adminRoutes.get('/users/:userId/activity', checkPermission(adminPermission), adminController.getUserActivity);
adminRoutes.get('/users', checkPermission(adminPermission), adminController.listUsers);
adminRoutes.patch('/users/:userId/approve', checkPermission(adminPermission), adminController.approveUser);
adminRoutes.patch('/users/:userId/reject', checkPermission(adminPermission), adminController.rejectUser);
adminRoutes.put('/users/:userId/permissions', checkPermission(adminPermission), adminController.updateUserPermissions);
adminRoutes.get('/permissions', checkPermission(adminPermission), adminController.listAllPermissions);

export default adminRoutes;
