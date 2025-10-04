import { compare } from 'bcryptjs'; // <-- MUDANÇA AQUI
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

    // A função compare continua a mesma
    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const { secret, expiresIn } = authConfig.jwt;

    const payload = {
      name: user.name,
      email: user.email,
      sub: user.id,
    };

    // @ts-ignore
    const token = sign(payload, secret, { expiresIn });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return { user: userResponse, token };
  }
}
