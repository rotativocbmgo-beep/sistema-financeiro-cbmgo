// api/src/services/ListProcessosService.ts

import { prisma } from "../server";

interface IListProcessosRequest {
  userId: string;
  page?: number;
  pageSize?: number;
}

export class ListProcessosService {
  async execute({ userId, page = 1, pageSize = 10 }: IListProcessosRequest) {
    // Garante que os parâmetros de paginação sejam números válidos
    const pageNumber = Number(page) || 1;
    const size = Number(pageSize) || 10;
    const skip = (pageNumber - 1) * size;

    // Constrói a cláusula 'where' para filtrar pelo usuário
    const where = { userId };

    // Executa duas queries em uma única transação para performance:
    // 1. Contar o número total de processos para o usuário.
    // 2. Buscar a página de processos desejada.
    const [totalProcessos, processos] = await prisma.$transaction([
      prisma.processo.count({ where }),
      prisma.processo.findMany({
        where,
        include: {
          // Inclui apenas o primeiro lançamento para obter o valor, otimizando o payload
          lancamentos: {
            take: 1,
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
        skip,
        take: size,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    // Calcula o total de páginas
    const totalPages = Math.ceil(totalProcessos / size);

    // Retorna os dados no formato padronizado com metadados de paginação
    return {
      data: processos,
      meta: {
        totalItems: totalProcessos,
        totalPages,
        currentPage: pageNumber,
        pageSize: size,
      },
    };
  }
}
