import { Request, Response } from "express";
import { TipoLancamento } from "@prisma/client";

// Serviços
import { GetSaldoService } from "../services/GetSaldoService";
import { GetTotalDespesasService } from "../services/GetTotalDespesasService";
import { GetChartDataService } from "../services/GetChartDataService";
import { GetMonthlyChartDataService } from "../services/GetMonthlyChartDataService";
import { ListLancamentosService } from "../services/ListLancamentosService";
import { UpdateLancamentoService } from "../services/UpdateLancamentoService";
import { DeleteLancamentoService } from "../services/DeleteLancamentoService";
import { ExportLancamentosService } from "../services/ExportLancamentosService";
import { ExportLancamentosPDFService } from "../services/ExportLancamentosPDFService";
import { CreateReposicaoService } from "../services/CreateReposicaoService"; // Importado

export class DashboardController {
  async getSaldo(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const getSaldo = new GetSaldoService();
      const result = await getSaldo.execute({ userId });
      return response.status(200).json(result);
    } catch (error: any) {
      return response.status(400).json({ error: error.message });
    }
  }

  async getTotalDespesas(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const getTotalDespesas = new GetTotalDespesasService();
      const result = await getTotalDespesas.execute({ userId });
      return response.status(200).json(result);
    } catch (error: any) {
      return response.status(400).json({ error: error.message });
    }
  }

  async getChartData(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { dataInicio, dataFim } = request.query;
      const getChartData = new GetChartDataService();
      const data = await getChartData.execute({
        userId,
        dataInicio: dataInicio ? String(dataInicio) : undefined,
        dataFim: dataFim ? String(dataFim) : undefined,
      });
      return response.status(200).json(data);
    } catch (error: any) {
      return response.status(400).json({ error: error.message });
    }
  }

  async getMonthlyChartData(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { dataInicio, dataFim } = request.query;
      const getMonthlyData = new GetMonthlyChartDataService();
      const data = await getMonthlyData.execute({
        userId,
        dataInicio: dataInicio ? String(dataInicio) : undefined,
        dataFim: dataFim ? String(dataFim) : undefined,
      });
      return response.status(200).json(data);
    } catch (error: any) {
      return response.status(400).json({ error: error.message });
    }
  }

  // --- MÉTODO DE REPOSIÇÃO ADICIONADO AQUI ---
  async createReposicao(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { data, historico, valor } = request.body;
      const createReposicaoService = new CreateReposicaoService();
      const reposicao = await createReposicaoService.execute({
        data: new Date(data), historico, valor, userId,
      });
      return response.status(201).json(reposicao);
    } catch (error) {
      return response.status(400).json({ error: (error as Error).message });
    }
  }

  // --- MÉTODOS DE LANÇAMENTOS ---
  async listLancamentos(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { page, pageSize, dataInicio, dataFim, tipo } = request.query;
      const listLancamentosService = new ListLancamentosService();
      const resultado = await listLancamentosService.execute({
        userId,
        page: page ? parseInt(String(page)) : undefined,
        pageSize: pageSize ? parseInt(String(pageSize)) : undefined,
        dataInicio: dataInicio ? String(dataInicio) : undefined,
        dataFim: dataFim ? String(dataFim) : undefined,
        tipo: tipo ? (String(tipo).toUpperCase() as TipoLancamento) : undefined,
      });
      return response.status(200).json(resultado);
    } catch (error) {
      return response.status(400).json({ error: (error as Error).message });
    }
  }

  async updateLancamento(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { id } = request.params;
      const { data, historico, valor } = request.body;
      const updateLancamentoService = new UpdateLancamentoService();
      const lancamento = await updateLancamentoService.execute({
        id, userId, data: data ? new Date(data) : undefined, historico, valor,
      });
      return response.status(200).json(lancamento);
    } catch (error) {
      return response.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteLancamento(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { id } = request.params;
      const deleteLancamentoService = new DeleteLancamentoService();
      await deleteLancamentoService.execute({ id, userId });
      return response.status(204).send();
    } catch (error) {
      return response.status(400).json({ error: (error as Error).message });
    }
  }

  // --- MÉTODOS DE EXPORTAÇÃO ---
  async exportCSV(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { dataInicio, dataFim, tipo } = request.query;
      const exportService = new ExportLancamentosService();
      const csv = await exportService.execute({
        userId,
        dataInicio: dataInicio ? String(dataInicio) : undefined,
        dataFim: dataFim ? String(dataFim) : undefined,
        tipo: tipo ? (String(tipo).toUpperCase() as TipoLancamento) : undefined,
      });
      const fileName = `extrato-${new Date().toISOString().split('T')[0]}.csv`;
      response.setHeader('Content-Type', 'text/csv; charset=utf-8');
      response.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      response.status(200).send('\uFEFF' + csv);
    } catch (error) {
      return response.status(400).json({ error: (error as Error).message });
    }
  }

  async exportPDF(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { dataInicio, dataFim, tipo } = request.query;
      const exportService = new ExportLancamentosPDFService();
      const pdfBuffer = await exportService.execute({
        userId,
        dataInicio: dataInicio ? String(dataInicio) : undefined,
        dataFim: dataFim ? String(dataFim) : undefined,
        tipo: tipo ? (String(tipo).toUpperCase() as TipoLancamento) : undefined,
      });
      const fileName = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`;
      response.setHeader('Content-Type', 'application/pdf');
      response.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      response.status(200).send(pdfBuffer);
    } catch (error) {
      return response.status(400).json({ error: (error as Error).message });
    }
  }
}
// commit para backup
