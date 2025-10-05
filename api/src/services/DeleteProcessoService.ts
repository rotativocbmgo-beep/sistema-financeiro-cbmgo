// api/src/services/DeleteProcessoService.ts

import { prisma } from "../server";
import { AppError } from "../errors/AppError";

interface IRequest {
  id: string;
  userId: string;
}

export class DeleteProcessoService {
  async execute({ id, userId }: IRequest) {
    // 1. Verifica se o processo a ser deletado realmente existe e se pertence ao usuário que fez a requisição.
    const processo = await prisma.processo.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    // 2. Se o processo não for encontrado ou não pertencer ao usuário, lança um erro.
    if (!processo) {
      throw new AppError(
        "Processo não encontrado ou você não tem permissão para excluí-lo.",
        404
      );
    }

    // 3. Utiliza uma transação do Prisma para garantir a atomicidade da operação.
    //    Ou tudo é executado com sucesso, ou nada é alterado no banco de dados.
    await prisma.$transaction([
      // Primeiro, deleta todos os lançamentos que têm o `processoId` correspondente.
      prisma.lancamento.deleteMany({
        where: { processoId: id },
      }),
      // Em seguida, deleta o processo em si.
      prisma.processo.delete({
        where: { id: id },
      }),
    ]);

    // 4. Retorna uma mensagem de sucesso (embora a rota vá retornar status 204 e não usar este retorno).
    return { message: "Processo e seus lançamentos foram excluídos com sucesso." };
  }
}
