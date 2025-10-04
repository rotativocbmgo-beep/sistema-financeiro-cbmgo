import net from 'net';
import 'dotenv/config';

// Host e Porta extraídos diretamente da sua string de conexão.
// Esta é a abordagem mais direta e à prova de erros de parsing.
const HOST = 'ep-broad-water-adwrepdc-pooler.c-2.us-east-1.aws.neon.tech';
const PORT = 5432;

async function checkConnection() {
  console.log('--- INICIANDO TESTE DE CONEXÃO DE REDE (VERSÃO SIMPLIFICADA) ---');
  console.log(`Tentando conectar ao Host: ${HOST}`);
  console.log(`Na Porta: ${PORT}`);

  const socket = new net.Socket();
  const timeout = 5000; // 5 segundos de timeout

  socket.setTimeout(timeout);

  socket.on('connect', () => {
    console.log('\n✅ SUCESSO! Conexão TCP estabelecida com o servidor do banco de dados!');
    console.log('Isso confirma que não há bloqueio de rede (Firewall). O problema é outro.');
    socket.destroy();
  });

  socket.on('error', (err: Error) => {
    console.error(`\n❌ FALHA: Erro de rede ao tentar conectar.`);
    console.error(`Detalhes: ${err.message}`);
    console.log('\n--- DIAGNÓSTICO ---');
    console.log('Este erro confirma um bloqueio de rede. Causas prováveis:');
    console.log('1. Firewall do Windows ou do Antivírus bloqueando a porta 5432.');
    console.log('2. Rede corporativa ou VPN restringindo o acesso.');
  });

  socket.on('timeout', () => {
    console.error(`\n❌ FALHA: A conexão expirou (timeout de ${timeout}ms). O servidor não respondeu.`);
    console.log('\n--- DIAGNÓSTICO ---');
    console.log('Este erro confirma um bloqueio de rede. Causas prováveis:');
    console.log('1. Firewall do Windows ou do Antivírus bloqueando a porta 5432.');
    console.log('2. Rede corporativa ou VPN restringindo o acesso.');
    socket.destroy();
  });

  // Inicia a tentativa de conexão
  socket.connect(PORT, HOST);
}

checkConnection();
