import { prisma } from "../server";

interface IGetProcessoRequest {
  id: string;
  userId: string;
}

export class GetProcessoService {
  async execute({ id, userId }: IGetProcessoRequest) {
    if (!id) {
      throw new Error("Processo id is required.");
    }

    const processo = await prisma.processo.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        lancamentos: {
          orderBy: {
            data: "asc",
          },
        },
      },
    });

    if (!processo) {
      throw new Error("Processo not found for this user.");
    }

    return processo;
  }
}
