import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../errors/AppError';
import { ExportReportToPDFService } from '../services/ExportReportToPDFService';

export class ReportController {
  // Criar um novo relatório (como rascunho)
  async create(request: Request, response: Response) {
    const { title, content } = request.body;
    const { id: creatorId } = request.user;

    if (!title || !content) {
      throw new AppError('Título e conteúdo são obrigatórios.', 400);
    }

    const report = await prisma.report.create({
      data: {
        title,
        content,
        creatorId,
        status: 'RASCUNHO',
      },
    });

    return response.status(201).json(report);
  }

  // Listar todos os relatórios
  async list(request: Request, response: Response) {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true },
        },
        signatures: {
          select: { id: true },
        },
      },
    });

    const reportsWithSignatureCount = reports.map(report => {
      const { signatures, ...rest } = report;
      return {
        ...rest,
        signatureCount: signatures.length,
      };
    });

    return response.json(reportsWithSignatureCount);
  }

  // Buscar um relatório específico por ID
  async getById(request: Request, response: Response) {
    const { id } = request.params;
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
        signatures: {
          orderBy: { signedAt: 'asc' },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!report) {
      throw new AppError('Relatório não encontrado.', 404);
    }

    return response.json(report);
  }

  // Atualizar um relatório (apenas se for rascunho)
  async update(request: Request, response: Response) {
    const { id } = request.params;
    const { title, content } = request.body;

    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) {
      throw new AppError('Relatório não encontrado.', 404);
    }
    if (report.status !== 'RASCUNHO') {
      throw new AppError('Apenas relatórios em rascunho podem ser editados.', 403);
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: { title, content },
    });

    return response.json(updatedReport);
  }

  // Mudar o status de um relatório para FINALIZADO
  async finalize(request: Request, response: Response) {
    const { id } = request.params;
    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) {
      throw new AppError('Relatório não encontrado.', 404);
    }
    if (report.status !== 'RASCUNHO') {
      throw new AppError('Apenas relatórios em rascunho podem ser finalizados.', 403);
    }

    await prisma.report.update({
      where: { id },
      data: { status: 'FINALIZADO' },
    });

    return response.status(204).send();
  }

  // Excluir um relatório (apenas se for rascunho)
  async delete(request: Request, response: Response) {
    const { id } = request.params;
    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) {
      throw new AppError('Relatório não encontrado.', 404);
    }
    if (report.status !== 'RASCUNHO') {
      throw new AppError('Apenas relatórios em rascunho podem ser excluídos.', 403);
    }

    await prisma.signature.deleteMany({ where: { reportId: id } });
    await prisma.report.delete({ where: { id } });

    return response.status(204).send();
  }

  // Assinar um relatório
  async signReport(request: Request, response: Response) {
    const { id: reportId } = request.params;
    const { id: userId } = request.user;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { signatures: true },
    });

    if (!report) {
      throw new AppError('Relatório não encontrado.', 404);
    }
    if (report.status === 'RASCUNHO') {
      throw new AppError('Relatórios em rascunho não podem ser assinados.', 403);
    }
    const alreadySigned = report.signatures.some(sig => sig.userId === userId);
    if (alreadySigned) {
      throw new AppError('Você já assinou este relatório.', 409);
    }

    const signature = await prisma.signature.create({
      data: {
        reportId,
        userId,
      },
    });

    if (report.status !== 'ASSINADO') {
      await prisma.report.update({
        where: { id: reportId },
        data: { status: 'ASSINADO' },
      });
    }

    return response.status(201).json(signature);
  }

  // Exportar um relatório para PDF
  async exportPDF(request: Request, response: Response) {
    const { id } = request.params;
    const exportService = new ExportReportToPDFService();

    try {
      const pdfBuffer = await exportService.execute({ reportId: id });
      
      response.setHeader('Content-Type', 'application/pdf');
      response.setHeader('Content-Disposition', `attachment; filename=relatorio-${id}.pdf`);
      
      response.send(pdfBuffer);

    } catch (error) {
      if (error instanceof AppError) {
        return response.status(error.statusCode).json({ message: error.message });
      }
      console.error(error);
      return response.status(500).json({ message: 'Erro interno ao gerar o PDF.' });
    }
  }
}
