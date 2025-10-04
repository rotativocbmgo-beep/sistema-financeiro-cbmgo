import { prisma } from "../server";
import { TipoLancamento } from "@prisma/client";
import { startOfDay, endOfDay } from 'date-fns';

interface IRequest {
  userId: string;
  dataInicio?: string;
  dataFim?: string;
}

interface ChartData {
  name: string;
  value: number;
}

export class GetChartDataService {
  async execute({ userId, dataInicio, dataFim }: IRequest): Promise<ChartData[]> {
    // 1. Monta a cláusula 'where' para a consulta
    const where: any = {
      userId,
      tipo: TipoLancamento.DEBITO, // Apenas despesas
    };

    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) {
        // Garante que o filtro comece no início do dia
        where.data.gte = startOfDay(new Date(dataInicio));
      }
      if (dataFim) {
        // Garante que o filtro termine no final do dia
        where.data.lte = endOfDay(new Date(dataFim));
      }
    }

    // 2. Usa a função 'groupBy' do Prisma para agrupar e somar
    const despesasAgrupadas = await prisma.lancamento.groupBy({
      by: ['historico'], // Agrupa pelo histórico da despesa
      where,
      _sum: {
        valor: true, // Soma os valores de cada grupo
      },
      orderBy: {
        _sum: {
          valor: 'desc', // Ordena pela soma, do maior para o menor
        },
      },
      take: 5, // Pega apenas os 5 primeiros (Top 5)
    });

    // 3. Formata os dados para o formato que o gráfico espera
    const chartData = despesasAgrupadas.map(item => ({
      name: item.historico,
      value: Number(item._sum.valor) || 0,
    }));

    return chartData;
  }
}
