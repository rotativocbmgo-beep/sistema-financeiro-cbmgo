// api/src/controllers/ProcessoController.ts

import { Request, Response } from "express";
import { AppError } from "../errors/AppError"; // Importar AppError

// --- Serviços ---
import { CreateProcessoService } from "../services/CreateProcessoService";
import { ListProcessosService } from "../services/ListProcessosService";
import { GetProcessoService } from "../services/GetProcessoService";
import { LiquidarProcessoService } from "../services/LiquidarProcessoService";
import { DeleteProcessoService } from "../services/DeleteProcessoService"; // 1. Importar o novo serviço

export class ProcessoController {
  // --- Métodos existentes (create, list, getById, liquidar) permanecem inalterados ---

  async create(request: Request, response: Response) {
    const { id: userId } = request.user;
    const { numero, credor, empenhoNumero, empenhoVerba, dataPagamento, valor } = request.body;
    const createProcessoService = new CreateProcessoService();
    const processo = await createProcessoService.execute({
      numero, credor, empenhoNumero, empenhoVerba, dataPagamento: new Date(dataPagamento), valor, userId,
    });
    return response.status(201).json(processo);
  }

  async list(request: Request, response: Response) {
    const { id: userId } = request.user;
    const { page, pageSize } = request.query;
    const listProcessosService = new ListProcessosService();
    const resultado = await listProcessosService.execute({ 
      userId,
      page: page ? parseInt(String(page)) : undefined,
      pageSize: pageSize ? parseInt(String(pageSize)) : undefined,
    });
    return response.status(200).json(resultado);
  }

  async getById(request: Request, response: Response) {
    const { id: userId } = request.user;
    const { id } = request.params;
    const getProcessoService = new GetProcessoService();
    const processo = await getProcessoService.execute({ id, userId });
    return response.status(200).json(processo);
  }

  async liquidar(request: Request, response: Response) {
    const { id: userId } = request.user;
    const { id } = request.params;
    const liquidarProcessoService = new LiquidarProcessoService();
    const processo = await liquidarProcessoService.execute({ id, userId });
    return response.status(200).json(processo);
  }

  // 2. Adicionar o novo método `delete`
  async delete(request: Request, response: Response) {
    const { id: userId } = request.user;
    const { id } = request.params; // Pega o ID do processo da URL

    const deleteProcessoService = new DeleteProcessoService();

    // Executa o serviço de exclusão
    await deleteProcessoService.execute({ id, userId });

    // Retorna uma resposta 204 No Content, indicando sucesso sem corpo de resposta.
    return response.status(204).send();
  }
}
