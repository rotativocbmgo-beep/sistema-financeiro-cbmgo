import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import 'dotenv/config';
import authConfig from '../src/config/auth';

async function verifyAuthLogic() {
  console.log('--- INICIANDO DIAGNÓSTICO DE AUTENTICAÇÃO ---');

  const emailToTest = 'admin@cbmgo.com';
  const passwordToTest = 'Cbmgo@2024'; // Use a senha correta do seu script de seed

  const prisma = new PrismaClient();

  try {
    // --- Etapa 1: Buscar Usuário e Permissões ---
    console.log(`[1/4] Buscando usuário "${emailToTest}" com permissões...`);
    const user = await prisma.user.findUnique({
      where: { email: emailToTest },
      include: { permissions: true },
    });

    if (!user || !user.password) {
      console.error('❌ FALHA: Usuário ou senha não encontrados no banco.');
      return;
    }
    console.log('✅ SUCESSO: Usuário encontrado.');

    // --- Etapa 2: Verificar a Senha ---
    console.log('[2/4] Verificando a correspondência da senha...');
    const passwordMatched = await compare(passwordToTest, user.password);

    if (!passwordMatched) {
      console.error('❌ FALHA: A senha fornecida NÃO corresponde ao hash do banco.');
      return;
    }
    console.log('✅ SUCESSO: A senha corresponde!');

    // --- Etapa 3: Preparar para Gerar o Token ---
    console.log('[3/4] Preparando dados para o token JWT...');
    const { secret, expiresIn } = authConfig.jwt;
    const userPermissions = user.permissions.map(p => p.action);
    console.log(`  - Subject (ID): ${user.id}`);
    console.log(`  - ExpiresIn: ${expiresIn}`);
    console.log(`  - Permissões: [${userPermissions.join(', ')}]`);

    // --- Etapa 4: Gerar o Token ---
    console.log('[4/4] Tentando gerar o token JWT...');
    const token = sign(
      { permissions: userPermissions },
      secret,
      {
        subject: user.id,
        expiresIn: expiresIn,
      }
    );

    console.log('✅ SUCESSO: Token JWT gerado com sucesso!');
    console.log('Token (início):', token.substring(0, 30) + '...');

  } catch (error) {
    console.error('❌ FALHA: Ocorreu um erro catastrófico durante o diagnóstico.', error);
  } finally {
    await prisma.$disconnect();
    console.log('--- DIAGNÓSTICO FINALIZADO ---');
  }
}

verifyAuthLogic();
