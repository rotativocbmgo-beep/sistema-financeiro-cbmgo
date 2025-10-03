import { prisma } from "../server";

interface IUpdateLancamentoRequest {
  id: string;
  userId: string;
  data?: Date;
  historico?: string;
  valor?: number;
}

export class UpdateLancamentoService {
  async execute({ id, userId, data, historico, valor }: IUpdateLancamentoRequest) {
    if (!id) {
      throw new Error("Lancamento id is required.");
    }

    if (!userId) {
      throw new Error("User id is required.");
    }

    const lancamento = await prisma.lancamento.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        processoId: true,
      },
    });

    if (!lancamento) {
      throw new Error("Lancamento not found.");
    }

    if (lancamento.userId !== userId) {
      throw new Error("You do not have permission to update this lancamento.");
    }

    if (lancamento.processoId) {
      throw new Error("Lancamentos linked to a processo cannot be updated individually.");
    }

    if (valor !== undefined && valor <= 0) {
      throw new Error("Lancamento value must be greater than zero.");
    }

    const dataToUpdate: { data?: Date; historico?: string; valor?: number } = {};

    if (data !== undefined) {
      dataToUpdate.data = data;
    }
    if (historico !== undefined) {
      dataToUpdate.historico = historico;
    }
    if (valor !== undefined) {
      dataToUpdate.valor = valor;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return prisma.lancamento.findUnique({ where: { id } });
    }

    const lancamentoAtualizado = await prisma.lancamento.update({
      where: { id },
      data: dataToUpdate,
    });

    return lancamentoAtualizado;
  }
}
