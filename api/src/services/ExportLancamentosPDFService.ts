import { prisma } from "../server";
import { TipoLancamento } from "@prisma/client";
import PDFDocument from 'pdfkit';
import axios from 'axios';

interface IExportRequest {
  userId: string;
  dataInicio?: string;
  dataFim?: string;
  tipo?: TipoLancamento;
}

async function fetchImage(url: string): Promise<Buffer> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error("Falha ao buscar a imagem do logo, usando placeholder.", error);
    const placeholderUrl = 'https://placehold.jp/150x50.png?text=Logo+Indisponivel';
    const response = await axios.get(placeholderUrl, { responseType: 'arraybuffer' } );
    return Buffer.from(response.data, 'binary');
  }
}

export class ExportLancamentosPDFService {
  async execute({ userId, dataInicio, dataFim, tipo }: IExportRequest): Promise<Buffer> {
    const where: any = { userId };
    if (tipo) where.tipo = tipo;
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) {
        const fimDoDia = new Date(dataFim);
        fimDoDia.setUTCHours(23, 59, 59, 999);
        where.data.lte = fimDoDia;
      }
    }
    const lancamentos = await prisma.lancamento.findMany({
      where,
      orderBy: { data: 'desc' },
    });

    if (lancamentos.length === 0) {
      throw new Error("Nenhum lançamento encontrado para os filtros selecionados.");
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    let totalPages = 0; // Manteremos o controle do total de páginas

    // --- Funções Auxiliares ---
    const addHeader = async (doc: PDFKit.PDFDocument) => {
      const logoUrl = 'https://placehold.jp/150x50.png?text=Sua+Logo';
      const logoImageBuffer = await fetchImage(logoUrl );

      doc.image(logoImageBuffer, 50, 45, { width: 150 });
      doc.fontSize(18).font('Helvetica-Bold').text('Relatório Financeiro', 250, 57, { align: 'right' });
      doc.fontSize(10).font('Helvetica').text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 250, 80, { align: 'right' });
      doc.moveDown(4);

      const tableTop = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Data', 50, tableTop);
      doc.text('Histórico', 120, tableTop);
      doc.text('Tipo', 350, tableTop);
      doc.text('Valor', 450, tableTop, { width: 100, align: 'right' });
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();
      doc.font('Helvetica');
    };

    // A função de rodapé agora será chamada no final, quando soubermos o total de páginas.
    const addFooters = (doc: PDFKit.PDFDocument) => {
        const range = doc.bufferedPageRange(); // { start: 0, count: totalDePaginas }
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).text(`Página ${i + 1} de ${range.count}`, 50, 780, { align: 'center', width: 500 });
        }
    };

    // --- Geração do Conteúdo ---
    await addHeader(doc);

    let totalCreditos = 0;
    let totalDebitos = 0;

    for (const lanc of lancamentos) {
      if (doc.y > 700) {
        doc.addPage();
        await addHeader(doc);
      }

      const y = doc.y;
      doc.text(new Date(lanc.data).toLocaleDateString('pt-BR'), 50, y);
      doc.text(lanc.historico, 120, y, { width: 220 });
      doc.text(lanc.tipo === 'CREDITO' ? 'Crédito' : 'Débito', 350, y);
      doc.fillColor(lanc.tipo === 'CREDITO' ? 'green' : 'red').text(
        Number(lanc.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        450, y, { width: 100, align: 'right' }
      ).fillColor('black');
      doc.moveDown();

      if (lanc.tipo === 'CREDITO') totalCreditos += Number(lanc.valor);
      else totalDebitos += Number(lanc.valor);
    }

    if (doc.y > 680) {
        doc.addPage();
        await addHeader(doc);
    }
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(2);

    const saldo = totalCreditos - totalDebitos;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(`Total de Créditos: ${totalCreditos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, { align: 'right' });
    doc.text(`Total de Débitos: ${totalDebitos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, { align: 'right' });
    doc.moveDown(0.5);
    doc.fontSize(14).text(`Saldo do Período: ${saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, { align: 'right' });

    // --- Finalização ---
    // Agora que todas as páginas foram adicionadas, podemos iterar sobre elas para adicionar os rodapés.
    addFooters(doc);

    return new Promise<Buffer>((resolve) => {
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.end();
    });
  }
}
