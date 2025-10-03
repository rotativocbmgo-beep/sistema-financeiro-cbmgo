// api/src/services/GetUserSettingsService.ts
import { prisma } from "../server";

interface IRequest {
  userId: string;
}

export class GetUserSettingsService {
  async execute({ userId }: IRequest) {
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    // Se o usuário ainda não tiver configurações, cria um registro vazio para ele
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId },
      });
    }

    return settings;
  }
}
