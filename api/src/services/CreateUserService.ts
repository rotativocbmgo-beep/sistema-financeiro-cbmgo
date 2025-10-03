import { hash } from 'bcryptjs';
import { prisma } from '../server';
import { IUser } from '../interfaces/IUser'; // A importação agora funciona

export class CreateUserService {
  async execute({ name, email, password }: IUser) {
    if (!password) {
      throw new Error('A senha é obrigatória.');
    }

    // O comando 'npx prisma generate' corrige o erro aqui.
    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      throw new Error('Este e-mail já está em uso.');
    }

    const hashedPassword = await hash(password, 8);

    // E aqui também.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Retorna o usuário sem a senha
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
