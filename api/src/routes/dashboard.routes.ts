// api/src/routes/dashboard.routes.ts

import { Router } from 'express';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { DashboardController } from '../controllers/DashboardController';

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

// Aplica o middleware de autenticação para todas as rotas deste arquivo
dashboardRoutes.use(ensureAuthenticated);

// --- ROTAS ESPECÍFICAS PRIMEIRO ---
// Estas rotas não têm parâmetros e devem ser declaradas antes das rotas genéricas.

// Rotas de dados para o Dashboard
dashboardRoutes.get('/saldo', dashboardController.getSaldo);
dashboardRoutes.get('/total-despesas', dashboardController.getTotalDespesas);
dashboardRoutes.get('/chart-data', dashboardController.getChartData);
dashboardRoutes.get('/monthly-chart-data', dashboardController.getMonthlyChartData);

// Rotas de Exportação
dashboardRoutes.get('/export/csv', dashboardController.exportCSV);
dashboardRoutes.get('/export/pdf', dashboardController.exportPDF);


// --- ROTAS DE RECURSO (com possíveis parâmetros) DEPOIS ---
// A rota GET para listar todos os lançamentos.
dashboardRoutes.get('/lancamentos', dashboardController.listLancamentos);

// Rotas que operam em um lançamento específico por ID.
// O Express processa as rotas na ordem em que são declaradas. Colocá-las no final
// garante que '/lancamentos/qualquer-coisa' não capture rotas como '/saldo'.
dashboardRoutes.put('/lancamentos/:id', dashboardController.updateLancamento);
dashboardRoutes.delete('/lancamentos/:id', dashboardController.deleteLancamento);

export default dashboardRoutes;
