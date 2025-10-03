import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import authConfig from '../config/auth'; // A importação agora funciona

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string; // ID do usuário
}

// A declaração do request.user foi movida para o arquivo @types/express.d.ts
// que já foi fornecido, então não é necessário aqui.

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    // Retornar um erro HTTP em vez de apenas lançar
    response.status(401).json({ error: 'Token JWT não informado.' });
    return;
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = verify(token, authConfig.jwt.secret);

    const { sub } = decoded as ITokenPayload;

    request.user = {
      id: sub,
    };

    return next();
  } catch {
    // Retornar um erro HTTP em vez de apenas lançar
    response.status(401).json({ error: 'Token JWT inválido.' });
    return;
  }
}
