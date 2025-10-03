import { prisma } from "../server";
import { TipoLancamento } from "@prisma/client";
import { Parser } from 'json2csv';

interface IExportRequest {
  userId: string;
  dataInicio?: string;
  dataFim?: string;
  tipo?: TipoLancamento;
}

export class ExportLancamentosService {
  async execute({ userId, dataInicio, dataFim, tipo }: IExportRequest) {
    const where: any = { userId };

    if (tipo) {
      where.tipo = tipo;
    }
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) {
        const fimDoDia = new Date(dataFim);
        fimDoDia.setUTCHours(23, 59, 59, 999);
        where.data.lte = fimDoDia;
      }
    }

    // Busca todos os lançamentos sem paginação
    const lancamentos = await prisma.lancamento.findMany({
      where,
      orderBy: {
        data: 'desc',
      },
      select: {
        data: true,
        historico: true,
        valor: true,
        tipo: true,
      }
    });

    if (lancamentos.length === 0) {
      throw new Error("Nenhum lançamento encontrado para os filtros selecionados.");
    }

    // Define os campos e cabeçalhos do CSV
    const fields = [
      { label: 'Data', value: 'data' },
      { label: 'Histórico', value: 'historico' },
      { label: 'Valor', value: 'valor' },
      { label: 'Tipo', value: 'tipo' },
    ];
    
    // Formata os dados para o CSV
    const formatadorData = new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });

    const dadosFormatados = lancamentos.map(l => ({
      data: formatadorData.format(new Date(l.data)),
      historico: l.historico,
      valor: Number(l.valor), // Garante que o valor seja numérico
      tipo: l.tipo === 'CREDITO' ? 'Crédito' : 'Débito'
    }));

    const json2csvParser = new Parser({ fields, delimiter: ';' }); // Usando ';' como delimitador
    const csv = json2csvParser.parse(dadosFormatados);

    return csv;
  }
}
