// api/src/routes/dashboard.routes.ts

import { Router } from 'express';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { DashboardController } from '../controllers/DashboardController'; // 1. MUDE A IMPORTAÇÃO

const dashboardRoutes = Router();
const dashboardController = new DashboardController(); // 2. CRIE A INSTÂNCIA DO NOVO CONTROLLER

// Todas as rotas de dashboard precisam de autenticação
dashboardRoutes.use(ensureAuthenticated);

// 3. APONTE AS ROTAS PARA OS MÉTODOS DO NOVO CONTROLLER
dashboardRoutes.get('/saldo', dashboardController.getSaldo);
dashboardRoutes.get('/chart-data', dashboardController.getChartData);
dashboardRoutes.get('/monthly-chart-data', dashboardController.getMonthlyChartData);

export default dashboardRoutes;
