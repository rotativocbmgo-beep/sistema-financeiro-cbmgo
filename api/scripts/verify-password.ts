// api/scripts/verify-password.ts
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import 'dotenv/config';

async function verifyPassword() {
  console.log('--- INICIANDO VERIFICAÇÃO DE SENHA ---');

  const emailToTest = 'admin@cbmgo.com';
  // Use a senha correta do seu script de seed
  const passwordToTest = 'Cbmgo@2024'; 

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ ERRO: DATABASE_URL não definida.');
    return;
  }

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    const user = await prisma.user.findUnique({
      where: { email: emailToTest },
    });

    if (!user) {
      console.error(`❌ FALHA: Usuário "${emailToTest}" não encontrado no banco de dados.`);
      return;
    }

    console.log(`✅ SUCESSO: Usuário "${emailToTest}" encontrado.`);
    console.log('ℹ️  Hash do banco de dados:', user.password);
    console.log('ℹ️  Testando a correspondência com a senha fornecida...');

    const passwordMatched = await compare(passwordToTest, user.password);

    if (passwordMatched) {
      console.log('✅ SUCESSO: A senha corresponde ao hash!');
    } else {
      console.error('❌ FALHA: A senha NÃO corresponde ao hash. Verifique a senha ou o script de seed.');
    }

  } catch (error) {
    console.error('❌ FALHA: Ocorreu um erro ao verificar a senha.', error);
  } finally {
    await prisma.$disconnect();
    console.log('--- VERIFICAÇÃO FINALIZADA ---');
  }
}

verifyPassword();
