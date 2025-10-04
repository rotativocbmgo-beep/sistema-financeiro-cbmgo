// api/scripts/check-db-connection.ts
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

async function checkDatabase() {
  console.log('--- INICIANDO DIAGNÓSTICO DE CONEXÃO COM O BANCO DE DADOS ---');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERRO: A variável de ambiente DATABASE_URL não está definida no arquivo .env.');
    process.exit(1);
  }

  console.log('ℹ️  DATABASE_URL encontrada. Tentando conectar...');

  let host = 'N/A';
  try {
    const url = new URL(databaseUrl);
    host = url.hostname;
    console.log(`ℹ️  Host detectado: ${host}`);
  } catch (e) {
    console.warn('⚠️  Aviso: Não foi possível parsear a DATABASE_URL para extrair o host.');
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  try {
    await prisma.$queryRaw`SELECT now()`;
    console.log('✅ SUCESSO: Conexão com o banco de dados estabelecida.');

    const users = await prisma.user.findMany({
      select: {
        email: true,
        createdAt: true,
      },
      take: 10,
    });

    if (users.length > 0) {
      console.log(`✅ SUCESSO: Tabela "User" encontrada com ${users.length} registro(s).`);
      console.log('------------------- AMOSTRA DE USUÁRIOS -------------------');
      console.table(users);
      console.log('---------------------------------------------------------');
    } else {
      console.warn('⚠️  AVISO: A tabela "User" está vazia ou não foi encontrada.');
    }

  } catch (error) {
    console.error('❌ FALHA: Ocorreu um erro durante o diagnóstico com o Prisma.');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('--- DIAGNÓSTICO FINALIZADO ---');
  }
}

checkDatabase();
