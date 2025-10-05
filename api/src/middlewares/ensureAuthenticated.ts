import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import authConfig from '../config/auth';
import { AppError } from '../errors/AppError'; // Importar o AppError

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string; // ID do usuário
}

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    // Lança um erro que será capturado pelo nosso error handler global.
    throw new AppError('Token JWT não informado.', 401);
  }

  // O formato é "Bearer TOKEN"
  const [, token] = authHeader.split(' ');

  try {
    // Verifica se o token é válido usando o segredo do authConfig
    const decoded = verify(token, authConfig.jwt.secret);

    // Força o tipo do payload decodificado
    const { sub } = decoded as ITokenPayload;

    // Adiciona o ID do usuário ao objeto request para uso posterior
    request.user = {
      id: sub,
    };

    // Se tudo estiver certo, permite que a requisição continue para o controller
    return next();
  } catch (err) {
    // Lança um erro claro se o token for inválido ou expirado.
    throw new AppError('Token JWT inválido ou expirado.', 401);
  }
}
