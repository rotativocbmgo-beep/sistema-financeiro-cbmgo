// api/src/routes/dashboard.routes.ts

import { Router } from 'express';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { DashboardController } from '../controllers/DashboardController';

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

// Todas as rotas aqui precisam de autenticação
dashboardRoutes.use(ensureAuthenticated);

// Rotas do Dashboard (Gráficos e Saldo)
dashboardRoutes.get('/saldo', dashboardController.getSaldo);
dashboardRoutes.get('/chart-data', dashboardController.getChartData);
dashboardRoutes.get('/monthly-chart-data', dashboardController.getMonthlyChartData);

// Rota de Lançamentos (CORREÇÃO PRINCIPAL)
dashboardRoutes.get('/lancamentos', dashboardController.listLancamentos);
dashboardRoutes.put('/lancamentos/:id', dashboardController.updateLancamento);
dashboardRoutes.delete('/lancamentos/:id', dashboardController.deleteLancamento);

// Rotas de Exportação
dashboardRoutes.get('/export/csv', dashboardController.exportCSV);
dashboardRoutes.get('/export/pdf', dashboardController.exportPDF);

export default dashboardRoutes;
