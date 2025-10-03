import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o script de seed...');

  // Agora, o TypeScript deve reconhecer 'prisma.user' sem problemas.
  const oldUser = await prisma.user.findUnique({
    where: { email: 'admin@cbmgo.com' },
  });

  if (oldUser) {
    console.log('Usuário admin@cbmgo.com encontrado. Deletando...');
    await prisma.user.delete({
      where: { email: 'admin@cbmgo.com' },
    });
    console.log('Usuário antigo deletado.');
  }

  console.log('Criando novo usuário padrão...');
  const hashedPassword = await hash('admin123', 8);

  const user = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@cbmgo.com',
      password: hashedPassword,
    },
  });

  console.log('Usuário padrão criado com sucesso:');
  console.log({ id: user.id, name: user.name, email: user.email });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed finalizado com sucesso.');
  })
  .catch(async (e) => {
    console.error('Ocorreu um erro durante o seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
