import { Request, Response } from "express";
import { z } from "zod";
import { PagamentoService } from "../services/PagamentoService";

// Schema para validação dos dados de criação.
const createSchema = z.object({
  descricao: z.string().min(1, "A descrição é obrigatória."),
  valor: z.number().positive("O valor deve ser um número positivo."),
  data: z.string().datetime("A data deve estar no formato ISO (ex: 2025-10-04T10:00:00Z)."),
});

// Schema para validação dos dados de atualização.
const updateSchema = createSchema.partial();

export class PagamentoController {
  private service = new PagamentoService();

  async list(_req: Request, res: Response) {
    try {
      const items = await this.service.list();
      return res.json(items);
    } catch (error) {
      console.error("Erro ao listar pagamentos:", error);
      return res.status(500).json({ error: "Falha ao listar pagamentos." });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "O ID deve ser um número." });
      }
      const item = await this.service.getById(id);
      if (!item) {
        return res.status(404).json({ message: "Pagamento não encontrado." });
      }
      return res.json(item);
    } catch (error) {
      console.error(`Erro ao buscar pagamento ${req.params.id}:`, error);
      return res.status(500).json({ error: "Falha ao buscar pagamento." });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const body = createSchema.parse(req.body);
      const created = await this.service.create(body);
      return res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos.", details: error.errors });
      }
      console.error("Erro ao criar pagamento:", error);
      return res.status(500).json({ error: "Falha ao criar pagamento." });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "O ID deve ser um número." });
      }
      const body = updateSchema.parse(req.body);
      const updated = await this.service.update(id, body);
      return res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos.", details: error.errors });
      }
      console.error(`Erro ao atualizar pagamento ${req.params.id}:`, error);
      return res.status(500).json({ error: "Falha ao atualizar pagamento." });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "O ID deve ser um número." });
      }
      await this.service.remove(id);
      return res.status(204).send();
    } catch (error) {
      console.error(`Erro ao remover pagamento ${req.params.id}:`, error);
      return res.status(500).json({ error: "Falha ao remover pagamento." });
    }
  }
}
