import { prisma } from '../server';
import { AppError } from '../errors/AppError';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

interface IRequest {
  reportId: string;
}

// Função auxiliar para buscar uma imagem (de URL ou local) e retornar como Buffer
async function fetchImage(url: string | null): Promise<Buffer | null> {
  if (!url) return null;

  try {
    // Tenta carregar como URL
    if (url.startsWith('http' )) {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data, 'binary');
    }
    // Tenta carregar como arquivo local (para desenvolvimento)
    const localPath = path.resolve(__dirname, '..', '..', url);
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }
    return null;
  } catch (error) {
    console.error(`Falha ao carregar a imagem de: ${url}`, error);
    return null; // Retorna nulo se a imagem não puder ser carregada
  }
}


export class ExportReportToPDFService {
  async execute({ reportId }: IRequest): Promise<Buffer> {
    // 1. Buscar todos os dados necessários em uma única consulta
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        creator: {
          include: {
            settings: true, // Puxa as configurações do criador (onde está o logo)
          },
        },
        signatures: {
          orderBy: { signedAt: 'asc' },
          include: {
            user: true, // Puxa os dados de quem assinou
          },
        },
      },
    });

    if (!report) {
      throw new AppError('Relatório não encontrado.', 404);
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    // --- CABEÇALHO ---
    const settings = report.creator.settings;
    const logoBuffer = await fetchImage(settings?.logoUrl || null);

    if (logoBuffer) {
      // CORREÇÃO APLICADA AQUI: Removido o 'align: 'left''
      doc.image(logoBuffer, 50, 45, { width: 100 });
    }

    doc.fontSize(12).font('Helvetica-Bold').text(settings?.companyName || 'Relatório do Sistema', 50, 50, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(settings?.address || '', { align: 'center' });
    doc.moveDown(2);

    // --- TÍTULO E METADADOS DO RELATÓRIO ---
    doc.fontSize(18).font('Helvetica-Bold').text(report.title, { align: 'center' });
    doc.moveDown(0.5);
    const creationDate = format(new Date(report.createdAt), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR });
    doc.fontSize(10).font('Helvetica-Oblique').text(`Criado por ${report.creator.name} em ${creationDate}`, { align: 'center' });
    doc.moveDown(2);

    // --- CONTEÚDO DO RELATÓRIO (JSON) ---
    doc.fontSize(12).font('Helvetica').text(JSON.stringify(report.content, null, 2));
    doc.moveDown(3);

    // --- SEÇÃO DE ASSINATURAS ---
    if (report.signatures.length > 0) {
      doc.addPage(); // Começa as assinaturas em uma nova página
      doc.fontSize(16).font('Helvetica-Bold').text('Assinaturas', { align: 'center' });
      doc.moveDown(2);

      for (const signature of report.signatures) {
        const signatureDate = format(new Date(signature.signedAt), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
        
        doc.font('Helvetica-Bold').fontSize(12).text(signature.user.name, { continued: true });
        doc.font('Helvetica').fontSize(10).text(` (Assinado digitalmente em ${signatureDate})`);
        
        doc.font('Helvetica-Oblique').fontSize(10).text(signature.user.email);
        
        doc.moveDown(2);
      }
    }

    // Finaliza o documento
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.end();
    });
  }
}
