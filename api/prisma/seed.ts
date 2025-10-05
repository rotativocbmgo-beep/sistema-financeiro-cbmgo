import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Lista de todas as permissões que o sistema terá
const permissionsToSeed = [
  // --- Permissões de Usuário ---
  { action: 'usuario:gerenciar', description: 'Permite aprovar, recusar e gerenciar permissões de outros usuários.' },
  { action: 'usuario:listar', description: 'Permite listar todos os usuários do sistema.' },

  // --- Permissões de Lançamento ---
  { action: 'lancamento:criar:debito', description: 'Permite criar um novo lançamento de débito (pagamento).' },
  { action: 'lancamento:criar:credito', description: 'Permite criar um novo lançamento de crédito (reposição).' },
  { action: 'lancamento:editar', description: 'Permite editar um lançamento manual (que não seja de processo).' },
  { action: 'lancamento:excluir', description: 'Permite excluir um lançamento manual.' },
  { action: 'lancamento:listar', description: 'Permite visualizar o extrato geral de lançamentos.' },

  // --- Permissões de Relatório ---
  { action: 'relatorio:criar', description: 'Permite criar e finalizar relatórios descritivos.' },
  { action: 'relatorio:assinar', description: 'Permite assinar digitalmente um relatório finalizado.' },
  { action: 'relatorio:visualizar', description: 'Permite visualizar todos os relatórios.' },
  { action: 'relatorio:exportar', description: 'Permite exportar relatórios em PDF.' },
  
  // --- Permissões de Processo ---
  { action: 'processo:liquidar', description: 'Permite liquidar um processo de pagamento.' },
];

async function main() {
  console.log('Iniciando o script de seed...');

  // --- Seed de Permissões ---
  console.log('Semeando permissões...');
  for (const p of permissionsToSeed) {
    await prisma.permission.upsert({
      where: { action: p.action },
      update: {},
      create: {
        action: p.action,
        description: p.description,
      },
    });
  }
  console.log('Permissões semeadas com sucesso!');


  // --- Criação do Usuário Admin (com todas as permissões) ---
  const adminEmail = 'admin@cbmgo.com';
  const oldAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (oldAdmin) {
    console.log(`Usuário ${adminEmail} já existe. Garantindo que ele tenha todas as permissões...`);
    
    const allPermissions = await prisma.permission.findMany();
    await prisma.user.update({
      where: { id: oldAdmin.id },
      data: {
        // Conecta o usuário a todas as permissões existentes
        permissions: {
          set: allPermissions.map(p => ({ id: p.id })),
        },
        // Garante que o usuário admin esteja sempre ATIVO
        status: 'ATIVO',
      },
    });
    console.log(`Permissões do usuário ${adminEmail} atualizadas.`);

  } else {
    console.log(`Criando novo usuário admin: ${adminEmail}`);
    const hashedPassword = await hash('Cbmgo@2024', 10); // Use uma senha segura
    
    const allPermissions = await prisma.permission.findMany();

    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        status: 'ATIVO', // Admin já nasce ATIVO
        // Conecta o novo admin a todas as permissões
        permissions: {
          connect: allPermissions.map(p => ({ id: p.id })),
        },
        settings: {
          create: {}, // Cria as configurações padrão
        },
      },
    });
    console.log('Usuário admin criado com todas as permissões.');
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Ocorreu um erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
