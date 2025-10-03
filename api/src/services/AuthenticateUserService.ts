import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { prisma } from '../server';
import authConfig from '../config/auth';
import { IAuth } from '../interfaces/IAuth'; // A importação agora funciona

export class AuthenticateUserService {
  async execute({ email, password }: IAuth) {
    // O comando 'npx prisma generate' corrige o erro aqui.
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const { secret, expiresIn } = authConfig.jwt;

    // A sintaxe da função sign estava correta, o problema era de tipagem do TS
    // que pode ser resolvido com as versões corretas das libs.
    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    // Não retornar a senha
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { user: userResponse, token };
  }
}
