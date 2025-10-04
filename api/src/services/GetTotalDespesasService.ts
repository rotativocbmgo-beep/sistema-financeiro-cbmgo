import { prisma } from "../server";
import { TipoLancamento } from "@prisma/client";

interface IRequest {
  userId: string;
}

export class GetTotalDespesasService {
  async execute({ userId }: IRequest) {
    const totalDebitos = await prisma.lancamento.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        userId: userId,
        tipo: TipoLancamento.DEBITO,
      },
    });

    const despesas = totalDebitos._sum?.valor || 0;

    return { totalDespesas: Number(despesas) };
  }
}
