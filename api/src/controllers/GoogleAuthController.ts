// api/src/controllers/GoogleAuthController.ts

import { Request, Response } from 'express';
import { AuthenticateWithGoogleService } from '../services/AuthenticateWithGoogleService';

export class GoogleAuthController {
  async handle(request: Request, response: Response) {
    const { code } = request.body;

    if (!code) {
      return response.status(400).json({ error: 'O código de autorização do Google não foi fornecido.' });
    }

    const authenticateWithGoogleService = new AuthenticateWithGoogleService();

    try {
      const result = await authenticateWithGoogleService.execute(code);
      return response.json(result);
    } catch (error: any) {
      // Captura erros específicos do serviço ou erros genéricos
      return response.status(error.statusCode || 400).json({ error: error.message });
    }
  }
}
