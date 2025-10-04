import { prisma } from "../server";
import { UpdateUserSettingsService } from "./UpdateUserSettingsService";
import fs from 'fs';
import path from 'path';
import uploadConfig from '../config/upload';

interface IRequest {
  userId: string;
  logoFilename: string;
}

export class UpdateUserLogoService {
  async execute({ userId, logoFilename }: IRequest) {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    // Se o usuário já tiver um logo, apaga o arquivo antigo para não acumular lixo
    if (userSettings && userSettings.logoUrl) {
      const oldLogoFilename = userSettings.logoUrl.split('/files/')[1];
      const oldLogoPath = path.join(uploadConfig.directory, oldLogoFilename);
      if (fs.existsSync(oldLogoPath)) {
        await fs.promises.unlink(oldLogoPath);
      }
    }

    // A URL base da API será obtida das variáveis de ambiente em produção
    const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3333}`;
    const logoUrl = `${apiUrl}/files/${logoFilename}`;

    const updateSettings = new UpdateUserSettingsService( );
    
    const settings = await updateSettings.execute({
      userId,
      logoUrl,
    });

    return settings;
  }
}
