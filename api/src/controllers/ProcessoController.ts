import { Request, Response } from "express";

// --- Serviços ---
import { CreateProcessoService } from "../services/CreateProcessoService";
import { ListProcessosService } from "../services/ListProcessosService";
import { GetProcessoService } from "../services/GetProcessoService";
import { LiquidarProcessoService } from "../services/LiquidarProcessoService";
import { DeleteProcessoService } from "../services/DeleteProcessoService"; // Importação adicionada

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
      const { page, pageSize } = request.query;
      
      const listProcessosService = new ListProcessosService();
      
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

  // --- MÉTODO DELETE ADICIONADO ---
  async delete(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { id } = request.params;
      const deleteProcessoService = new DeleteProcessoService();
      await deleteProcessoService.execute({ id, userId });
      // Retorna 204 No Content, que é o padrão para exclusões bem-sucedidas
      return response.status(204).send(); 
    } catch (error) {
      return response.status(400).json({ error: (error as Error).message });
    }
  }
}
