// api/src/services/CreateProcessoService.ts

import { prisma } from "../server";
import { AppError } from "../errors/AppError";
import { StatusProcesso, TipoLancamento } from "@prisma/client";

// 1. A interface agora inclui um campo opcional para a URL do comprovante.
interface ICreateProcessoRequest {
  numero: string;
  credor: string;
  empenhoNumero?: string | null;
  empenhoVerba?: string | null;
  dataPagamento: Date;
  valor: number;
  userId: string;
  comprovanteUrl?: string | null; // <-- CAMPO ADICIONADO
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
    comprovanteUrl, // <-- Recebe o novo campo
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
        throw new AppError("Já existe um processo cadastrado com este número.", 409);
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
      await tx.lancamento.create({
        data: {
          data: dataPagamento,
          historico: `Pagamento para ${credor} (Processo ${numero})`,
          valor: valor,
          tipo: TipoLancamento.DEBITO,
          userId,
          processoId: processo.id,
          comprovanteUrl: comprovanteUrl, // <-- 2. A URL do comprovante é salva aqui
        },
      });

      // 4. Retorna o processo criado
      return processo;
    });
  }
}
