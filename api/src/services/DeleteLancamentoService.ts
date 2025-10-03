import { prisma } from "../server";

interface IDeleteLancamentoRequest {
  id: string;
  userId: string;
}

export class DeleteLancamentoService {
  async execute({ id, userId }: IDeleteLancamentoRequest) {
    if (!id) {
      throw new Error("O ID do lançamento é obrigatório.");
    }

    // CORREÇÃO: findUnique é o correto aqui. O erro anterior indicava que o
    // campo 'userId' não estava sendo reconhecido no tipo retornado.
    // A regeneração do cliente Prisma (npx prisma generate) deve resolver isso.
    const lancamento = await prisma.lancamento.findUnique({
      where: { id },
    });

    if (!lancamento) {
      throw new Error("Lançamento não encontrado.");
    }

    if (lancamento.userId !== userId) {
      throw new Error("Você não tem permissão para excluir este lançamento.");
    }

    if (lancamento.processoId) {
      throw new Error(
        "Este lançamento está vinculado a um processo e não pode ser excluído individualmente."
      );
    }

    await prisma.lancamento.delete({
      where: { id },
    });

    return { message: "Lançamento excluído com sucesso." };
  }
}
