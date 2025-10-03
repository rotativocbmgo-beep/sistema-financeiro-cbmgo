import { prisma } from "../server";
import { TipoLancamento } from "@prisma/client";

interface ICreateReposicaoRequest {
  data: Date;
  historico: string;
  valor: number;
  userId: string;
}

export class CreateReposicaoService {
  async execute({ data, historico, valor, userId }: ICreateReposicaoRequest) {
    if (!data || !historico || !valor || !userId) {
      throw new Error("Dados essenciais (data, histórico, valor, userId) estão faltando.");
    }
    if (valor <= 0) {
      throw new Error("O valor da reposição deve ser positivo.");
    }

    // CORREÇÃO: Usando a forma direta e simples.
    // O erro anterior acontecia por uma inconsistência de tipos inferidos pelo Prisma.
    // Após regenerar o client, esta sintaxe deve ser aceita.
    const reposicao = await prisma.lancamento.create({
      data: {
        data,
        historico,
        valor,
        tipo: TipoLancamento.CREDITO,
        userId, // Passando o ID do usuário diretamente.
      },
    });

    return reposicao;
  }
}
