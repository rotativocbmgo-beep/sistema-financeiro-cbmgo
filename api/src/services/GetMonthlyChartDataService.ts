import { prisma } from "../server";
import { TipoLancamento } from "@prisma/client";

interface IGetMonthlyChartDataRequest {
  userId: string;
  dataInicio?: string; // Parâmetro opcional
  dataFim?: string;    // Parâmetro opcional
}

export class GetMonthlyChartDataService {
  async execute({ userId, dataInicio, dataFim }: IGetMonthlyChartDataRequest) {
    // Constrói a cláusula 'where' dinamicamente
    const where: any = {
      userId,
    };

    // Adiciona o filtro de data
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

    const lancamentos = await prisma.lancamento.findMany({
      where, // Usa a cláusula 'where' construída
      orderBy: {
        data: 'asc',
      },
    });

    // Estrutura para agregar os dados por mês/ano
    const monthlyData: { [key: string]: { creditos: number; debitos: number } } = {};

    lancamentos.forEach(lancamento => {
      const monthYear = lancamento.data.toISOString().substring(0, 7); // Formato "YYYY-MM"
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { creditos: 0, debitos: 0 };
      }
      if (lancamento.tipo === TipoLancamento.CREDITO) {
        monthlyData[monthYear].creditos += Number(lancamento.valor);
      } else {
        monthlyData[monthYear].debitos += Number(lancamento.valor);
      }
    });

    const chartData = Object.keys(monthlyData).map(monthYear => ({
      name: monthYear,
      creditos: monthlyData[monthYear].creditos,
      debitos: monthlyData[monthYear].debitos,
    }));

    return chartData;
  }
}
