import { Request, Response } from 'express';
import { AuthenticateUserService } from '../services/AuthenticateUserService';

export class SessionsController {
  async create(request: Request, response: Response) {
    try {
      const { email, password } = request.body;
      const authService = new AuthenticateUserService();
      const { user, token } = await authService.execute({ email, password });
      return response.json({ user, token });
    } catch (error) {
      return response.status(401).json({ error: (error as Error).message });
    }
  }
}
