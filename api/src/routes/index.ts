// api/src/routes/index.ts

import { Router } from 'express';

// Importações padrão
import usersRoutes from './users.routes';
import sessionsRoutes from './sessions.routes';
import processosRoutes from './processos.routes';
import settingsRoutes from './settings.routes';
import dashboardRoutes from './dashboard.routes'; // 1. IMPORTE AS NOVAS ROTAS

const router = Router();

// Registrando as rotas na aplicação
router.use('/users', usersRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/processos', processosRoutes);
router.use('/settings', settingsRoutes);

// 2. USE AS NOVAS ROTAS (usando a raiz '/')
// Agora, requisições como /lancamentos, /saldo, etc., serão tratadas aqui.
router.use('/', dashboardRoutes); 

export default router;
