// api/src/controllers/AdminController.ts

import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../errors/AppError';

export class AdminController {
  // Listar usuários por status (sem alterações)
  async listUsers(request: Request, response: Response) {
    const { status } = request.query;

    if (status !== 'PENDENTE' && status !== 'ATIVO' && status !== 'RECUSADO') {
      throw new AppError('Status inválido. Use PENDENTE, ATIVO ou RECUSADO.', 400);
    }

    const users = await prisma.user.findMany({
      where: { status: status as any },
      // Para a lista, continuamos enviando dados mínimos para performance
      select: { id: true, name: true, email: true, status: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    return response.json(users);
  }

  // --- NOVO MÉTODO ---
  // Buscar um usuário específico pelo ID com suas permissões
  async getUserById(request: Request, response: Response) {
    const { userId } = request.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      // Inclui as permissões associadas para o modal de edição
      include: {
        permissions: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    // Remove a senha da resposta por segurança
    const { password, ...userWithoutPassword } = user;

    return response.json(userWithoutPassword);
  }

  // Aprovar um usuário e definir suas permissões (sem alterações)
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

  // Recusar um usuário (sem alterações)
  async rejectUser(request: Request, response: Response) {
    const { userId } = request.params;
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'RECUSADO', permissions: { set: [] } },
    });
    return response.status(204).send();
  }

  // Editar permissões de um usuário já ativo (sem alterações)
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

  // Listar todas as permissões cadastradas no sistema (sem alterações)
  async listAllPermissions(request: Request, response: Response) {
    const permissions = await prisma.permission.findMany({
      orderBy: { action: 'asc' },
    });
    return response.json(permissions);
  }
}
