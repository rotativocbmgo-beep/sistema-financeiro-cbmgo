import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../errors/AppError';
// CORREÇÃO: Importar as funções de data
import { startOfDay, endOfDay } from 'date-fns';

export class AdminController {
  // ... (métodos listUsers, getUserById, approveUser, etc. permanecem inalterados)
  async listUsers(request: Request, response: Response) {
    const { status } = request.query;

    if (status !== 'PENDENTE' && status !== 'ATIVO' && status !== 'RECUSADO') {
      throw new AppError('Status inválido. Use PENDENTE, ATIVO ou RECUSADO.', 400);
    }

    const users = await prisma.user.findMany({
      where: { status: status as any },
      select: { id: true, name: true, email: true, status: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    return response.json(users);
  }

  async getUserById(request: Request, response: Response) {
    const { userId } = request.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    const { password, ...userWithoutPassword } = user;

    return response.json(userWithoutPassword);
  }

  async approveUser(request: Request, response: Response) {
    const { userId } = request.params;
    const { permissions } = request.body;

    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw new AppError('É necessário fornecer um array de permissões.', 400);
    }

    const permissionsInDb = await prisma.permission.findMany({
      where: { action: { in: permissions } },
    });

    if (permissionsInDb.length !== permissions.length) {
      throw new AppError('Uma ou mais permissões fornecidas são inválidas.', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ATIVO',
        permissions: {
          set: permissionsInDb.map(p => ({ id: p.id })),
        },
      },
    });

    return response.json({ message: 'Usuário aprovado com sucesso!', user: { id: updatedUser.id, status: updatedUser.status } });
  }

  async rejectUser(request: Request, response: Response) {
    const { userId } = request.params;
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'RECUSADO', permissions: { set: [] } },
    });
    return response.status(204).send();
  }

  async updateUserPermissions(request: Request, response: Response) {
    const { userId } = request.params;
    const { permissions } = request.body;

    if (!Array.isArray(permissions)) {
      throw new AppError('É necessário fornecer um array de permissões.', 400);
    }

    const permissionsInDb = await prisma.permission.findMany({
      where: { action: { in: permissions } },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        permissions: {
          set: permissionsInDb.map(p => ({ id: p.id })),
        },
      },
    });

    return response.json({ message: 'Permissões do usuário atualizadas com sucesso.' });
  }

  async listAllPermissions(request: Request, response: Response) {
    const permissions = await prisma.permission.findMany({
      orderBy: { action: 'asc' },
    });
    return response.json(permissions);
  }

  async bulkAction(request: Request, response: Response) {
    const { userIds, action } = request.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new AppError('É necessário fornecer um array de IDs de usuário.', 400);
    }
    if (action !== 'approve' && action !== 'reject') {
      throw new AppError('Ação inválida. Use "approve" ou "reject".', 400);
    }

    if (action === 'approve') {
      await prisma.user.updateMany({
        where: {
          id: { in: userIds },
          status: 'PENDENTE',
        },
        data: {
          status: 'ATIVO',
        },
      });
    } else if (action === 'reject') {
      await prisma.user.updateMany({
        where: {
          id: { in: userIds },
          status: 'PENDENTE',
        },
        data: {
          status: 'RECUSADO',
        },
      });
    }

    return response.status(200).json({ message: `Ação '${action}' executada com sucesso para ${userIds.length} usuários.` });
  }

  async getUserActivity(request: Request, response: Response) {
    const { userId } = request.params;

    const activityLogs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return response.json(activityLogs);
  }

  // --- MÉTODO CORRIGIDO ---
  async listAllActivities(request: Request, response: Response) {
    const { userId, dataInicio, dataFim, page = 1, pageSize = 15 } = request.query;

    const pageNumber = Number(page);
    const size = Number(pageSize);
    const skip = (pageNumber - 1) * size;

    const where: any = {};

    if (userId && typeof userId === 'string') {
      where.userId = userId;
    }

    // CORREÇÃO APLICADA AQUI
    if (dataInicio || dataFim) {
      where.timestamp = {};
      if (dataInicio && typeof dataInicio === 'string') {
        // Garante que o filtro comece no início do dia
        where.timestamp.gte = startOfDay(new Date(dataInicio));
      }
      if (dataFim && typeof dataFim === 'string') {
        // Garante que o filtro termine no final do dia
        where.timestamp.lte = endOfDay(new Date(dataFim));
      }
    }

    const [totalLogs, logs] = await prisma.$transaction([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: size,
        skip: skip,
      }),
    ]);

    const totalPages = Math.ceil(totalLogs / size);

    return response.json({
      data: logs,
      meta: {
        totalItems: totalLogs,
        totalPages,
        currentPage: pageNumber,
        pageSize: size,
      },
    });
  }
}
