import { prisma } from "../server";

interface IRequest {
  userId: string;
  companyName?: string;
  cnpj?: string;
  address?: string;
  logoUrl?: string;
}

/**
 * Atualiza ou cria (upsert) as configurações de um usuário.
 * O 'upsert' é útil para garantir que a operação funcione tanto
 * para usuários que já têm configurações quanto para os que não têm.
 */
export class UpdateUserSettingsService {
  async execute({ userId, ...data }: IRequest) {
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });

    return settings;
  }
}
