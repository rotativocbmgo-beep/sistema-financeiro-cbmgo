import { prisma } from "../server";

interface IRequest {
  id: string;
  userId: string;
}

export class DeleteProcessoService {
  async execute({ id, userId }: IRequest) {
    // 1. Verifica se o processo existe e pertence ao usuário
    const processo = await prisma.processo.findFirst({
      where: { 
        id: id,
        userId: userId 
      },
    });

    if (!processo) {
      throw new Error("Processo não encontrado ou você não tem permissão para excluí-lo.");
    }

    // 2. Usa uma transação para deletar os lançamentos e o processo de forma atômica
    // Isso garante que se um falhar, o outro também não é executado.
    await prisma.$transaction([
      prisma.lancamento.deleteMany({
        where: { processoId: id },
      }),
      prisma.processo.delete({
        where: { id: id },
      }),
    ]);

    return { message: "Processo e seus lançamentos foram excluídos com sucesso." };
  }
}
