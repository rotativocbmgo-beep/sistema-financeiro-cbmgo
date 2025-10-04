// api/src/controllers/ProcessoController.ts

import { Request, Response } from "express";
import { TipoLancamento } from "@prisma/client";

// --- Serviços ---
import { CreateProcessoService } from "../services/CreateProcessoService";
import { ListProcessosService } from "../services/ListProcessosService";
import { GetProcessoService } from "../services/GetProcessoService";
import { LiquidarProcessoService } from "../services/LiquidarProcessoService";
import { CreateReposicaoService } from "../services/CreateReposicaoService";

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
      // Extrai os parâmetros de paginação da query string da URL
      const { page, pageSize } = request.query;
      
      const listProcessosService = new ListProcessosService();
      
      // Executa o serviço passando os parâmetros de paginação
      const resultado = await listProcessosService.execute({ 
        userId,
        page: page ? parseInt(String(page)) : undefined,
        pageSize: pageSize ? parseInt(String(pageSize)) : undefined,
      });
      
      return response.status(200).json(resultado);
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

  // --- Método para Reposição (Lançamento de Crédito) ---
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
}
