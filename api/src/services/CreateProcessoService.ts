import { prisma } from "../server";
import { StatusProcesso, TipoLancamento } from "@prisma/client";

interface ICreateProcessoRequest {
  numero: string;
  credor: string;
  empenhoNumero: string;
  empenhoVerba: string;
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
    if (!numero || !credor || !valor || !userId) {
      throw new Error("Dados essenciais (número, credor, valor, userId) estão faltando.");
    }

    if (valor <= 0) {
      throw new Error("O valor do processo deve ser positivo.");
    }

    const processoExistente = await prisma.processo.findUnique({
      where: { numero },
    });

    if (processoExistente) {
      throw new Error("Já existe um processo cadastrado com este número.");
    }

    const processo = await prisma.processo.create({
      data: {
        numero,
        credor,
        empenhoNumero,
        empenhoVerba,
        status: StatusProcesso.PENDENTE,
        userId,
        lancamentos: {
          create: {
            data: dataPagamento,
            // CORREÇÃO: Adicionada a crase de fechamento ` no final da string.
            historico: `Pagamento para ${credor} (Processo ${numero})`,
            valor: valor,
            tipo: TipoLancamento.DEBITO,
            userId,
          },
        },
      },
      include: {
        lancamentos: true,
      },
    });

    return processo;
  }
}
