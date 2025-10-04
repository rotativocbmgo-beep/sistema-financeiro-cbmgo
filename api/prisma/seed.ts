import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o script de seed...');

  const adminEmail = 'admin@cbmgo.com';
  const oldUser = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (oldUser) {
    console.log('Usuário admin@cbmgo.com encontrado. Deletando...');

    // Deleta primeiro a configuração do usuário (UserSettings)
    await prisma.userSettings.deleteMany({
      where: {
        userId: oldUser.id,
      },
    });

    // Agora deleta o usuário
    await prisma.user.delete({
      where: {
        id: oldUser.id,
      },
    });
    console.log('Usuário admin antigo deletado com sucesso.');
  }

  const hashedPassword = await bcrypt.hash('Cbmgo@2024', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      settings: {
        create: {
          // A propriedade 'theme' foi removida daqui,
          // pois não existe no modelo UserSettings.
          // O Prisma criará a entrada UserSettings vazia, apenas com a relação.
        },
      },
    },
    include: {
      settings: true,
    },
  });

  console.log('Seed concluído com sucesso!');
  console.log('Usuário criado:', user);
}

main()
  .catch((e) => {
    console.error('Ocorreu um erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });