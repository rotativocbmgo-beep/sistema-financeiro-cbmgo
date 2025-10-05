// api/src/routes/index.ts

import { Router } from 'express';

// Importações padrão
import usersRoutes from './users.routes';
import sessionsRoutes from './sessions.routes';
import settingsRoutes from './settings.routes';
import dashboardRoutes from './dashboard.routes';
import processosRoutes from './processos.routes';
import adminRoutes from './admin.routes';
import reportsRoutes from './reports.routes';
import googleRoutes from './google.routes'; // <-- IMPORTAR A NOVA ROTA

const router = Router();

// Registrando todas as rotas na aplicação
router.use('/users', usersRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/auth/google', googleRoutes); // <-- REGISTRAR A ROTA DO GOOGLE
router.use('/settings', settingsRoutes);
router.use('/processos', processosRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportsRoutes);
router.use('/', dashboardRoutes);

// Exportação padrão
export default router;
