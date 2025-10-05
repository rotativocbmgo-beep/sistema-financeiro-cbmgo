import { prisma } from "../server";
import { AppError } from "../errors/AppError";
import { StatusProcesso, TipoLancamento } from "@prisma/client";

interface ICreateProcessoRequest {
  numero: string;
  credor: string;
  empenhoNumero?: string | null;
  empenhoVerba?: string | null;
  dataPagamento: Date;
  valor: number;
  userId: string;
}

export class CreateProcessoService {
  async execute({
    numero,
    credor,
    empenhoNumero,
    empenhoVerba,
    dataPagamento,
    valor,
    userId,
  }: ICreateProcessoRequest) {
    // Validações iniciais
    if (!numero || !credor || !valor || !userId) {
      throw new AppError("Dados essenciais (número, credor, valor, userId) estão faltando.", 400);
    }

    if (valor <= 0) {
      throw new AppError("O valor do processo deve ser positivo.", 400);
    }

    // Utiliza uma transação para garantir a atomicidade da operação
    return await prisma.$transaction(async (tx) => {
      // 1. Verifica se já existe um processo com o mesmo número dentro da transação
      const processoExistente = await tx.processo.findUnique({
        where: { numero },
      });

      if (processoExistente) {
        throw new AppError("Já existe um processo cadastrado com este número.", 409); // 409 Conflict é mais apropriado
      }

      // 2. Cria o novo Processo
      const processo = await tx.processo.create({
        data: {
          numero,
          credor,
          empenhoNumero,
          empenhoVerba,
          status: StatusProcesso.PENDENTE,
          userId,
        },
      });

      // 3. Cria o Lançamento inicial associado ao Processo
      // Se esta operação falhar, a criação do processo (passo 2) será desfeita.
      await tx.lancamento.create({
        data: {
          data: dataPagamento,
          historico: `Pagamento para ${credor} (Processo ${numero})`,
          valor: valor,
          tipo: TipoLancamento.DEBITO,
          userId,
          processoId: processo.id, // Associa o lançamento ao processo recém-criado
        },
      });

      // 4. Retorna o processo criado (sem os lançamentos, para um payload mais limpo)
      return processo;
    });
  }
}
