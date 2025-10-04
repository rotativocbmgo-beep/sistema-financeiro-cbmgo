import { Request, Response } from "express";
import { GetUserSettingsService } from "../services/GetUserSettingsService";
import { UpdateUserSettingsService } from "../services/UpdateUserSettingsService";
import { UpdateUserLogoService } from "../services/UpdateUserLogoService"; // Importar o novo serviço

export class UserSettingsController {
  /**
   * Lida com a requisição para obter as configurações do usuário logado.
   */
  async get(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const getUserSettings = new GetUserSettingsService();
      const settings = await getUserSettings.execute({ userId });
      return response.json(settings);
    } catch (error: any) {
      return response.status(400).json({ error: error.message });
    }
  }

  /**
   * Lida com a requisição para atualizar as configurações do usuário.
   */
  async update(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      const { companyName, cnpj, address } = request.body;
      
      const updateUserSettings = new UpdateUserSettingsService();
      const settings = await updateUserSettings.execute({
        userId,
        companyName,
        cnpj,
        address,
      });

      return response.json(settings);
    } catch (error: any) {
      return response.status(400).json({ error: error.message });
    }
  }

  /**
   * Lida com a requisição para atualizar o logotipo do usuário.
   */
  async updateLogo(request: Request, response: Response) {
    try {
      const { id: userId } = request.user;
      if (!request.file) {
        return response.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
      }
      const { filename } = request.file;

      const updateUserLogo = new UpdateUserLogoService();
      const settings = await updateUserLogo.execute({
        userId,
        logoFilename: filename,
      });

      return response.json(settings);
    } catch (error: any) {
      return response.status(400).json({ error: error.message });
    }
  }
}
