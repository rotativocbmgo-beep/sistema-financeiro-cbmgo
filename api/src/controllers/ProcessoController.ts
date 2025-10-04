import { Request, Response } from "express";
import { TipoLancamento } from "@prisma/client";

// --- Serviços ---
import { CreateProcessoService } from "../services/CreateProcessoService";
import { ListProcessosService } from "../services/ListProcessosService";
import { GetProcessoService } from "../services/GetProcessoService";
import { LiquidarProcessoService } from "../services/LiquidarProcessoService";
import { CreateReposicaoService } from "../services/CreateReposicaoService";
import { ListLancamentosService } from "../services/ListLancamentosService";
import { UpdateLancamentoService } from "../services/UpdateLancamentoService";
import { DeleteLancamentoService } from "../services/DeleteLancamentoService";
import { ExportLancamentosService } from "../services/ExportLancamentosService";
import { ExportLancamentosPDFService } from "../services/ExportLancamentosPDFService";

export class ProcessoController {
  // --- Métodos para Processos ---
  async create(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { numero, credor, empenhoNumero, empenhoVerba, dataPagamento, valor } = request.body;
      const createProcessoService = new CreateProcessoService();
      const processo = await createProcessoService.execute({
        numero, credor, empenhoNumero, empenhoVerba, dataPagamento: new Date(dataPagamento), valor, userId,
      });
      return response.status(201).json(processo);
    } catch (error) {
      return response.status(400).json({ error: (error as Error).message });
    }
  }

  async list(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const listProcessosService = new ListProcessosService();
      const processos = await listProcessosService.execute({ userId });
      return response.status(200).json(processos);
    } catch (error) {
      return response.status(400).json({ error: (error as Error).message });
    }
  }

  async getById(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { id } = request.params;
      const getProcessoService = new GetProcessoService();
      const processo = await getProcessoService.execute({ id, userId });
      return response.status(200).json(processo);
    } catch (error) {
      return response.status(404).json({ error: (error as Error).message });
    }
  }

  async liquidar(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { id } = request.params;
      const liquidarProcessoService = new LiquidarProcessoService();
      const processo = await liquidarProcessoService.execute({ id, userId });
      return response.status(200).json(processo);
    } catch (error) {
      return response.status(400).json({ error: (error as Error).message });
    }
  }

  // --- Métodos para Lançamentos (Reposições, etc.) ---
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

  async update(request: Request, response: Response) {
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

  async delete(request: Request, response: Response) {
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

  // --- Métodos para Exportação ---
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
