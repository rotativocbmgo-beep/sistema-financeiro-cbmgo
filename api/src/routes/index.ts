// api/src/routes/index.ts

import { Router } from 'express';

// Importações padrão (sem chaves)
import usersRoutes from './users.routes';
import sessionsRoutes from './sessions.routes';
import processosRoutes from './processos.routes';
import pagamentosRoutes from './pagamentos.routes';
import settingsRoutes from './settings.routes';
import dashboardRoutes from './dashboard.routes'; // 1. IMPORTE AS NOVAS ROTAS

const router = Router();

// Registrando as rotas na aplicação
router.use('/users', usersRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/processos', processosRoutes);
router.use('/pagamentos', pagamentosRoutes);
router.use('/settings', settingsRoutes);
router.use('/', dashboardRoutes); // 2. USE AS NOVAS ROTAS (usando a raiz '/')

// Exportação padrão (sem chaves)
export default router;
