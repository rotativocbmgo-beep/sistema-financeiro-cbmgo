// api/src/services/CreateUserService.ts

import { hash } from 'bcrypt'; // <-- MUDANÇA AQUI
import { prisma } from '../server';
import { IUser } from '../interfaces/IUser';

export class CreateUserService {
  async execute({ name, email, password }: IUser) {
    if (!password) {
      throw new Error('A senha é obrigatória.');
    }

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      throw new Error('Este e-mail já está em uso.');
    }

    const hashedPassword = await hash(password, 8);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // @ts-ignore
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
