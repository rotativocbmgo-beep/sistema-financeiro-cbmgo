import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { prisma } from '../server';
import authConfig from '../config/auth';
import { IAuth } from '../interfaces/IAuth';
import { AppError } from '../errors/AppError';

export class AuthenticateUserService {
  async execute({ email, password }: IAuth) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { permissions: true },
    });

    if (!user) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    if (!user.password) {
      throw new AppError('Este usuário não possui uma senha cadastrada. Tente fazer login com o Google.', 401);
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    if (user.status === 'PENDENTE') {
      throw new AppError('Seu cadastro está pendente de aprovação pelo administrador.', 403);
    }

    if (user.status === 'RECUSADO') {
      throw new AppError('Seu acesso foi recusado pelo administrador.', 403);
    }

    const { secret, expiresIn } = authConfig.jwt;
    const userPermissions = user.permissions.map(p => p.action);

    // @ts-ignore - Ignorando o erro de sobrecarga falso-positivo do editor
    const token = sign(
      { permissions: userPermissions },
      secret,
      {
        subject: user.id,
        expiresIn: expiresIn,
      }
    );

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { user: userResponse, token };
  }
}
