import { prisma } from "../server";
import { TipoLancamento } from "@prisma/client";

interface IListLancamentosRequest {
  userId: string; // ID do usuário é obrigatório
  page?: number;
  pageSize?: number;
  dataInicio?: string;
  dataFim?: string;
  tipo?: TipoLancamento;
}

export class ListLancamentosService {
  async execute({ userId, page = 1, pageSize = 10, dataInicio, dataFim, tipo }: IListLancamentosRequest) {
    const pageNumber = Number(page) || 1;
    const size = Number(pageSize) || 10;
    const skip = (pageNumber - 1) * size;

    // Constrói a cláusula 'where' dinamicamente
    const where: any = {
      userId, // Filtro principal: sempre busca apenas os lançamentos do usuário logado
    };

    if (tipo) {
      where.tipo = tipo;
    }

    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) {
        where.data.gte = new Date(dataInicio);
      }
      if (dataFim) {
        const fimDoDia = new Date(dataFim);
        fimDoDia.setUTCHours(23, 59, 59, 999);
        where.data.lte = fimDoDia;
      }
    }

    const [totalLancamentos, lancamentos] = await prisma.$transaction([
      prisma.lancamento.count({ where }),
      prisma.lancamento.findMany({
        where,
        skip: skip,
        take: size,
        orderBy: {
          data: 'desc',
        },
      }),
    ]);

    const totalPages = Math.ceil(totalLancamentos / size);

    return {
      data: lancamentos,
      meta: {
        totalItems: totalLancamentos,
        totalPages,
        currentPage: pageNumber,
        pageSize: size,
      },
    };
  }
}
