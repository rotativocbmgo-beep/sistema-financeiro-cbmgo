import { prisma } from "../server";
import { TipoLancamento } from "@prisma/client";
import { startOfMonth, endOfMonth, eachMonthOfInterval, format } from 'date-fns';

interface IRequest {
  userId: string;
  dataInicio?: string;
  dataFim?: string;
}

interface MonthlyData {
  name: string; // Formato 'YYYY-MM'
  receitas: number;
  despesas: number;
}

export class GetMonthlyChartDataService {
  async execute({ userId, dataInicio, dataFim }: IRequest): Promise<MonthlyData[]> {
    // 1. Determinar o intervalo de datas para a consulta
    let startDate: Date;
    let endDate: Date;

    if (dataInicio && dataFim) {
      startDate = startOfMonth(new Date(dataInicio));
      endDate = endOfMonth(new Date(dataFim));
    } else {
      // Se não houver filtro, busca o primeiro e último lançamento do usuário
      const firstLancamento = await prisma.lancamento.findFirst({
        where: { userId },
        orderBy: { data: 'asc' },
      });
      const lastLancamento = await prisma.lancamento.findFirst({
        where: { userId },
        orderBy: { data: 'desc' },
      });

      if (!firstLancamento) {
        return []; // Se não há lançamentos, retorna um array vazio
      }

      startDate = startOfMonth(firstLancamento.data);
      endDate = lastLancamento ? endOfMonth(lastLancamento.data) : startOfMonth(new Date());
    }

    // 2. Buscar os dados agregados do banco de dados de uma só vez
    const lancamentosAgregados = await prisma.lancamento.groupBy({
      by: ['tipo', 'data'],
      where: {
        userId,
        data: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        valor: true,
      },
    });

    // 3. Criar um mapa com todos os meses do intervalo, inicializados com zero
    const monthsInInterval = eachMonthOfInterval({ start: startDate, end: endDate });
    const monthlyDataMap = new Map<string, MonthlyData>();

    for (const monthDate of monthsInInterval) {
      const monthKey = format(monthDate, 'yyyy-MM');
      monthlyDataMap.set(monthKey, {
        name: monthKey,
        receitas: 0,
        despesas: 0,
      });
    }

    // 4. Preencher o mapa com os dados agregados do banco
    for (const lanc of lancamentosAgregados) {
      const monthKey = format(lanc.data, 'yyyy-MM');
      const monthData = monthlyDataMap.get(monthKey);

      if (monthData) {
        const valor = Number(lanc._sum.valor) || 0;
        if (lanc.tipo === TipoLancamento.CREDITO) {
          monthData.receitas += valor;
        } else {
          monthData.despesas += valor;
        }
      }
    }

    // 5. Converter o mapa para um array e ordenar por data
    const result = Array.from(monthlyDataMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }
}
