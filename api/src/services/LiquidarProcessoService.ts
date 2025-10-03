import { prisma } from "../server";
import { StatusProcesso } from "@prisma/client";

interface ILiquidarProcessoRequest {
  id: string;
  userId: string;
}

export class LiquidarProcessoService {
  async execute({ id, userId }: ILiquidarProcessoRequest) {
    if (!id) {
      throw new Error("O ID do processo é obrigatório.");
    }

    // CORREÇÃO: O erro aqui também era um erro de digitação.
    // O campo no modelo é 'userId', e a regeneração do cliente garante que ele exista no tipo 'ProcessoWhereInput'.
    const processo = await prisma.processo.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!processo) {
      throw new Error("Processo não encontrado ou você não tem permissão para liquidá-lo.");
    }

    if (processo.status === StatusProcesso.LIQUIDADO) {
      throw new Error("Este processo já foi liquidado.");
    }

    const processoLiquidado = await prisma.processo.update({
      where: {
        id: id,
      },
      data: {
        status: StatusProcesso.LIQUIDADO,
      },
    });

    return processoLiquidado;
  }
}
