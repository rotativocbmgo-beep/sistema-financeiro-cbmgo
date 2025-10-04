import { Router } from 'express';

// Importações padrão
import usersRoutes from './users.routes';
import sessionsRoutes from './sessions.routes';
import settingsRoutes from './settings.routes';
import dashboardRoutes from './dashboard.routes';
import processosRoutes from './processos.routes'; // A importação deve estar aqui

const router = Router();

// Registrando todas as rotas na aplicação
router.use('/users', usersRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/settings', settingsRoutes);

// CORREÇÃO: Adicionando as rotas de processos e dashboard
router.use('/processos', processosRoutes);
router.use('/', dashboardRoutes); // Usando a raiz para as rotas de dados do dashboard

// Exportação padrão
export default router;
