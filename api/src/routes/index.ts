import { Router } from 'express';
import processosRouter from './processos.routes';
import usersRouter from './users.routes';
import sessionsRouter from './sessions.routes';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ProcessoController } from '../controllers/ProcessoController';
import { GetChartDataService } from '../services/GetChartDataService';
import { GetMonthlyChartDataService } from '../services/GetMonthlyChartDataService';

const router = Router();
const processoController = new ProcessoController();

// --- ROTAS PÚBLICAS ---
router.use('/users', usersRouter);
router.use('/sessions', sessionsRouter);

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
router.use(ensureAuthenticated);

// --- ROTAS PROTEGIDAS ---

// Rotas da entidade "Processo"
router.use('/processos', processosRouter);

// Rotas de lançamentos, saldo e reposições
router.get("/saldo", processoController.getSaldo);
router.get("/lancamentos", processoController.listLancamentos);
router.put("/lancamentos/:id", processoController.update);
router.delete("/lancamentos/:id", processoController.delete);
router.post("/reposicoes", processoController.createReposicao);

// Rota para dados do gráfico de pizza (Donut)
router.get("/chart-data", async (request, response) => {
  try {
    const { id: userId } = request.user;
    const { dataInicio, dataFim } = request.query; // Captura os parâmetros

    const getChartData = new GetChartDataService();
    const data = await getChartData.execute({
      userId,
      dataInicio: dataInicio ? String(dataInicio) : undefined,
      dataFim: dataFim ? String(dataFim) : undefined,
    });
    return response.json(data);
  } catch (error: any) {
    return response.status(400).json({ error: error.message });
  }
});

// Rota para dados do gráfico de barras (Mensal)
router.get("/monthly-chart-data", async (request, response) => {
  try {
    const { id: userId } = request.user;
    const { dataInicio, dataFim } = request.query; // Captura os parâmetros

    const getMonthlyChartData = new GetMonthlyChartDataService();
    const data = await getMonthlyChartData.execute({
      userId,
      dataInicio: dataInicio ? String(dataInicio) : undefined,
      dataFim: dataFim ? String(dataFim) : undefined,
    });
    return response.json(data);
  } catch (error: any) {
    return response.status(400).json({ error: error.message });
  }
});

export default router;
