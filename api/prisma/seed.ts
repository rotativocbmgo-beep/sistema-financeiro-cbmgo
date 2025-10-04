// api/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o script de seed...');

  const adminEmail = 'admin@cbmgo.com';
  const oldUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (oldUser) {
    console.log(`Usuário ${adminEmail} encontrado. Deletando para recriar...`);
    // Para deletar o usuário, precisamos deletar seus dados relacionados primeiro
    await prisma.lancamento.deleteMany({ where: { userId: oldUser.id } });
    await prisma.processo.deleteMany({ where: { userId: oldUser.id } });
    await prisma.userSettings.deleteMany({ where: { userId: oldUser.id } });
    await prisma.user.delete({ where: { id: oldUser.id } });
    console.log('Usuário antigo e seus dados foram deletados.');
  }

  // Use uma senha forte e conhecida
  const password = 'Cbmgo@2024';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Criando novo usuário ${adminEmail} com a senha: ${password}`);
  const user = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      settings: {
        create: {}, // Cria as configurações padrão
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
