import { Request, Response } from 'express';
import { CreateUserService } from '../services/CreateUserService';

export class UsersController {
  async create(request: Request, response: Response) {
    try {
      const { name, email, password } = request.body;
      const createUserService = new CreateUserService();
      const user = await createUserService.execute({ name, email, password });
      
      // @ts-ignore
      delete user.password; // Remover senha da resposta

      return response.status(201).json(user);
    } catch (error) {
      return response.status(400).json({ error: (error as Error).message });
    }
  }
}
