import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import authConfig from '../config/auth';
import { AppError } from '../errors/AppError';

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string;
  permissions: string[];
}

export function checkPermission(requiredPermissions: string[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    const authHeader = request.headers.authorization;

    // Embora ensureAuthenticated já faça isso, é uma boa prática de defesa em profundidade.
    if (!authHeader) {
      throw new AppError('Token JWT não informado.', 401);
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = verify(token, authConfig.jwt.secret);
      const { permissions: userPermissions } = decoded as ITokenPayload;

      // Verifica se o usuário tem pelo menos UMA das permissões necessárias.
      const hasPermission = requiredPermissions.some(requiredPermission =>
        userPermissions.includes(requiredPermission)
      );

      if (!hasPermission) {
        throw new AppError('Você não tem permissão para executar esta ação.', 403);
      }

      return next();
    } catch (err) {
      // Trata tanto erros de verificação do token quanto o AppError lançado acima.
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError('Token JWT inválido ou expirado.', 401);
    }
  };
}
