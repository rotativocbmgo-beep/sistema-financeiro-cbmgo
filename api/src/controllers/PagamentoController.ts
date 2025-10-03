import { Request, Response } from "express";
import { z } from "zod";
import { PagamentoService } from "../services/PagamentoService";

const createSchema = z.object({
  descricao: z.string().min(1),
  valor: z.number().positive(),
  data: z.string().min(1) // ISO date
});

export class PagamentoController {
  private service = new PagamentoService();

  list = async (_req: Request, res: Response) => {
    const items = await this.service.list();
    res.json(items);
  };

  getById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const item = await this.service.getById(id);
    if (!item) return res.status(404).json({ message: "Pagamento não encontrado" });
    res.json(item);
  };

  create = async (req: Request, res: Response) => {
    const body = createSchema.parse(req.body);
    const created = await this.service.create(body);
    res.status(201).json(created);
  };

  update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const body = createSchema.partial().parse(req.body);
    const updated = await this.service.update(id, body);
    res.json(updated);
  };

  remove = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await this.service.remove(id);
    res.status(204).send();
  };
}
