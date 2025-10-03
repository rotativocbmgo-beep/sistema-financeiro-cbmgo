import { prisma } from "../server";
import { TipoLancamento } from "@prisma/client";

interface IGetSaldoRequest {
  userId: string;
}

export class GetSaldoService {
  async execute({ userId }: IGetSaldoRequest) {
    // CORREÇÃO: O erro aqui era de fato um erro de digitação meu.
    // O campo no modelo é 'userId', e a regeneração do cliente garante que ele exista no tipo 'LancamentoWhereInput'.
    const totalCreditos = await prisma.lancamento.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        tipo: TipoLancamento.CREDITO,
        userId: userId,
      },
    });

    const totalDebitos = await prisma.lancamento.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        tipo: TipoLancamento.DEBITO,
        userId: userId,
      },
    });

    // CORREÇÃO: Adicionando verificação para o caso de _sum ser nulo.
    const creditos = totalCreditos._sum?.valor || 0;
    const debitos = totalDebitos._sum?.valor || 0;
    const saldo = Number(creditos) - Number(debitos);

    return { saldo };
  }
}
