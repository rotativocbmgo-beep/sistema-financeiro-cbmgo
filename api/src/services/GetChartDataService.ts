import { prisma } from "../server";
import { TipoLancamento } from "@prisma/client";

interface IGetChartDataRequest {
  userId: string;
  dataInicio?: string; // Parâmetro opcional
  dataFim?: string;    // Parâmetro opcional
}

export class GetChartDataService {
  async execute({ userId, dataInicio, dataFim }: IGetChartDataRequest) {
    // Constrói a cláusula 'where' dinamicamente
    const where: any = {
      userId,
      tipo: TipoLancamento.DEBITO,
    };

    // Adiciona o filtro de data se os parâmetros forem fornecidos
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

    const debitosAgrupados = await prisma.lancamento.groupBy({
      by: ['historico'],
      _sum: {
        valor: true,
      },
      where, // Usa a cláusula 'where' construída
      orderBy: {
        _sum: {
          valor: 'desc',
        },
      },
      take: 5,
    });

    const chartData = debitosAgrupados.map(item => ({
      name: item.historico,
      value: Number(item._sum.valor),
    }));

    return chartData;
  }
}
