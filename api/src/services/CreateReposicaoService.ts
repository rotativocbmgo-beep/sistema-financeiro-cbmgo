// api/src/services/CreateReposicaoService.ts

import { prisma } from "../server";
import { AppError } from "../errors/AppError";
import { TipoLancamento } from "@prisma/client";

// 1. A interface também é atualizada aqui para incluir o comprovante.
interface ICreateReposicaoRequest {
  data: Date;
  historico: string;
  valor: number;
  userId: string;
  comprovanteUrl?: string | null; // <-- CAMPO ADICIONADO
}

export class CreateReposicaoService {
  async execute({ data, historico, valor, userId, comprovanteUrl }: ICreateReposicaoRequest) {
    if (!data || !historico || !valor || !userId) {
      throw new AppError("Dados essenciais (data, histórico, valor, userId) estão faltando.", 400);
    }
    if (valor <= 0) {
      throw new AppError("O valor da reposição deve ser positivo.", 400);
    }

    const reposicao = await prisma.lancamento.create({
      data: {
        data,
        historico,
        valor,
        tipo: TipoLancamento.CREDITO,
        userId,
        comprovanteUrl: comprovanteUrl, // <-- 2. A URL do comprovante é salva aqui
      },
    });

    return reposicao;
  }
}
