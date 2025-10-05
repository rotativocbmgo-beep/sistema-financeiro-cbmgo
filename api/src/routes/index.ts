import { Router } from 'express';

// Importações padrão
import usersRoutes from './users.routes';
import sessionsRoutes from './sessions.routes';
import settingsRoutes from './settings.routes';
import dashboardRoutes from './dashboard.routes';
import processosRoutes from './processos.routes';
import adminRoutes from './admin.routes';
import reportsRoutes from './reports.routes'; // <-- IMPORTAR

const router = Router();

// Registrando todas as rotas na aplicação
router.use('/users', usersRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/settings', settingsRoutes);
router.use('/processos', processosRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportsRoutes); // <-- REGISTRAR
router.use('/', dashboardRoutes);

// Exportação padrão
export default router;
