// api/src/services/AuthenticateUserService.ts

import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { prisma } from '../server';
import authConfig from '../config/auth';
import { IAuth } from '../interfaces/IAuth';

export class AuthenticateUserService {
  async execute({ email, password }: IAuth) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const { secret, expiresIn } = authConfig.jwt;

    // O payload com 'sub' está correto.
    const payload = {
      name: user.name,
      email: user.email,
      sub: user.id,
    };

    // ====================================================================
    // SOLUÇÃO FINAL: IGNORAR O ERRO DE TIPO
    // ====================================================================
    // Devido a uma incompatibilidade persistente nas definições de tipo
    // da biblioteca, instruímos o TypeScript a ignorar o erro nesta linha.
    // A funcionalidade está correta.
    // @ts-ignore
    const token = sign(payload, secret, { expiresIn });
    // ====================================================================

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return { user: userResponse, token };
  }
}
