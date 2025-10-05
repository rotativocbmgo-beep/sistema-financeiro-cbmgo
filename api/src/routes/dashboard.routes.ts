// api/src/routes/dashboard.routes.ts

import { Router } from 'express';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { DashboardController } from '../controllers/DashboardController';

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

// Aplica o middleware de autenticação para todas as rotas deste arquivo
dashboardRoutes.use(ensureAuthenticated);

// --- ROTAS DE DADOS PARA O DASHBOARD ---
dashboardRoutes.get('/saldo', dashboardController.getSaldo);
dashboardRoutes.get('/total-despesas', dashboardController.getTotalDespesas);
dashboardRoutes.get('/chart-data', dashboardController.getChartData);
dashboardRoutes.get('/monthly-chart-data', dashboardController.getMonthlyChartData);

// --- NOVA ROTA PARA ATIVIDADES RECENTES ---
dashboardRoutes.get('/recent-activities', dashboardController.getRecentActivities);

// --- ROTA DE CRIAÇÃO DE REPOSIÇÃO (CRÉDITO) ---
dashboardRoutes.post('/reposicoes', dashboardController.createReposicao);

// --- ROTAS DE EXPORTAÇÃO ---
dashboardRoutes.get('/export/csv', dashboardController.exportCSV);
dashboardRoutes.get('/export/pdf', dashboardController.exportPDF);

// --- ROTAS DE RECURSO (LANÇAMENTOS) ---
dashboardRoutes.get('/lancamentos', dashboardController.listLancamentos);
dashboardRoutes.put('/lancamentos/:id', dashboardController.updateLancamento);
dashboardRoutes.delete('/lancamentos/:id', dashboardController.deleteLancamento);

export default dashboardRoutes;
