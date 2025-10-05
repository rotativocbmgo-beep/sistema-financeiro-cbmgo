import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken'; // <-- CORREÇÃO: Removido o 's' extra
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

    if (!authHeader) {
      throw new AppError('Token JWT não informado.', 401);
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = verify(token, authConfig.jwt.secret);
      const { permissions: userPermissions } = decoded as ITokenPayload;

      const hasPermission = requiredPermissions.some(requiredPermission =>
        userPermissions.includes(requiredPermission)
      );

      if (!hasPermission) {
        throw new AppError('Você não tem permissão para executar esta ação.', 403);
      }

      return next();
    } catch (err) {
      throw new AppError('Token JWT inválido ou expirado.', 401);
    }
  };
}
