import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { prisma } from '../server';
import authConfig from '../config/auth';
import { IAuth } from '../interfaces/IAuth';
import { AppError } from '../errors/AppError';
import { CreateActivityLogService } from './CreateActivityLogService'; // 1. IMPORTAR O SERVIÇO DE LOG

export class AuthenticateUserService {
  async execute({ email, password }: IAuth) {
    const logService = new CreateActivityLogService(); // 2. INSTANCIAR O SERVIÇO

    const user = await prisma.user.findUnique({
      where: { email },
      include: { permissions: true },
    });

    // --- Lógica de Log para Falhas ---
    if (!user || !user.password) {
      // Registra a tentativa de login para um e-mail que não existe ou não tem senha
      await logService.execute({
        userId: 'system', // Usamos 'system' ou um ID genérico pois o usuário não foi validado
        action: 'Falha de Login: Usuário não encontrado',
        details: { emailAttempt: email },
      });
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      // Registra a tentativa de senha incorreta para um usuário existente
      await logService.execute({
        userId: user.id,
        action: 'Falha de Login: Senha incorreta',
        details: { emailAttempt: email },
      });
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    if (user.status !== 'ATIVO') {
      const action = `Falha de Login: Status do usuário é ${user.status}`;
      await logService.execute({ userId: user.id, action });
      const message = user.status === 'PENDENTE'
        ? 'Seu cadastro está pendente de aprovação pelo administrador.'
        : 'Seu acesso foi recusado pelo administrador.';
      throw new AppError(message, 403);
    }
    
    // --- Lógica de Log para Sucesso ---
    await logService.execute({
      userId: user.id,
      action: 'Login bem-sucedido com e-mail/senha',
    });

    const { secret, expiresIn } = authConfig.jwt;
    const userPermissions = user.permissions.map(p => p.action);

    // @ts-ignore
    const token = sign(
      { permissions: userPermissions },
      secret,
      {
        subject: user.id,
        expiresIn: expiresIn,
      }
    );

    const userResponse = { id: user.id, name: user.name, email: user.email };
    return { user: userResponse, token };
  }
}
