import { prisma } from "../server";

interface IListProcessosRequest {
  userId: string;
}

export class ListProcessosService {
  async execute({ userId }: IListProcessosRequest) {
    const processos = await prisma.processo.findMany({
      where: {
        userId,
      },
      include: {
        lancamentos: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return processos;
  }
}
