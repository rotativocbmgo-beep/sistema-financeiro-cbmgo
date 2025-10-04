// api/src/controllers/DashboardController.ts

import { Request, Response } from "express";
import { GetChartDataService } from "../services/GetChartDataService";
import { GetMonthlyChartDataService } from "../services/GetMonthlyChartDataService";
import { GetSaldoService } from "../services/GetSaldoService";

export class DashboardController {
  /**
   * Busca o saldo total do usuário.
   */
  async getSaldo(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const getSaldoService = new GetSaldoService();
      const { saldo } = await getSaldoService.execute({ userId });
      return response.status(200).json({ saldo });
    } catch (error) {
      return response.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * Busca dados agregados para o gráfico de rosca (Donut Chart).
   */
  async getChartData(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { dataInicio, dataFim } = request.query;

      const getChartDataService = new GetChartDataService();
      const data = await getChartDataService.execute({
        userId,
        dataInicio: dataInicio ? String(dataInicio) : undefined,
        dataFim: dataFim ? String(dataFim) : undefined,
      });

      return response.status(200).json(data);
    } catch (error) {
      return response.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * Busca dados mensais de receita vs. despesa para o gráfico de barras.
   */
  async getMonthlyChartData(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { dataInicio, dataFim } = request.query;

      const getMonthlyChartDataService = new GetMonthlyChartDataService();
      const data = await getMonthlyChartDataService.execute({
        userId,
        dataInicio: dataInicio ? String(dataInicio) : undefined,
        dataFim: dataFim ? String(dataFim) : undefined,
      });

      return response.status(200).json(data);
    } catch (error) {
      return response.status(400).json({ error: (error as Error).message });
    }
  }
}
