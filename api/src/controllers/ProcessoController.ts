// api/src/controllers/ProcessoController.ts

import { Request, Response } from "express";
import { AppError } from "../errors/AppError";

// --- Serviços ---
import { CreateProcessoService } from "../services/CreateProcessoService";
import { ListProcessosService } from "../services/ListProcessosService";
import { GetProcessoService } from "../services/GetProcessoService";
import { LiquidarProcessoService } from "../services/LiquidarProcessoService";
import { DeleteProcessoService } from "../services/DeleteProcessoService";

export class ProcessoController {
  async create(request: Request, response: Response) {
    const { id: userId } = request.user;
    const { numero, credor, empenhoNumero, empenhoVerba, dataPagamento, valor } = request.body;

    // 1. Verifica se um arquivo foi enviado pelo multer.
    // Se sim, constrói a URL de acesso público para ele.
    const comprovanteUrl = request.file ? `/files/${request.file.filename}` : null;

    const createProcessoService = new CreateProcessoService();
    
    const processo = await createProcessoService.execute({
      numero,
      credor,
      empenhoNumero,
      empenhoVerba,
      dataPagamento: new Date(dataPagamento),
      valor,
      userId,
      comprovanteUrl, // 2. Passa a URL (ou null) para o serviço.
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

  async delete(request: Request, response: Response) {
    const { id: userId } = request.user;
    const { id } = request.params;

    const deleteProcessoService = new DeleteProcessoService();
    await deleteProcessoService.execute({ id, userId });

    return response.status(204).send();
  }
}
