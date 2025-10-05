// api/src/middlewares/validateRequest.ts

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
// A CORREÇÃO ESTÁ AQUI: removido o 's' extra.
import { AppError } from '../errors/AppError';

/**
 * Middleware de validação que usa um schema Zod para verificar
 * os dados da requisição (body, query, params).
 *
 * @param schema - Um objeto Zod (AnyZodObject) que define a estrutura de validação.
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Realiza a validação dos dados da requisição contra o schema fornecido.
      // O método `parse` do Zod lança um erro se a validação falhar.
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Se a validação for bem-sucedida, passa para o próximo middleware ou controller.
      return next();
    } catch (error) {
      // Se o erro for uma instância de ZodError, significa que a validação falhou.
      if (error instanceof ZodError) {
        // Mapeia os erros do Zod para um formato mais legível.
        const errorDetails = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        // Lança um AppError com status 400 (Bad Request) e os detalhes da validação.
        // Este erro será capturado pelo nosso error handler global.
        throw new AppError('Erro de validação de dados.', 400, errorDetails);
      }
      
      // Para qualquer outro tipo de erro, repassa para o error handler global.
      return next(error);
    }
  };
};
