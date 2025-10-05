// api/src/services/AuthenticateWithGoogleService.ts

import { prisma } from '../server';
import axios from 'axios';
import { sign } from 'jsonwebtoken';
import authConfig from '../config/auth';
import { AppError } from '../errors/AppError';

interface IAccessTokenResponse {
  access_token: string;
}

interface IUserResponse {
  id: string;
  email: string;
  name: string;
}

export class AuthenticateWithGoogleService {
  async execute(code: string) {
    const url = 'https://oauth2.googleapis.com/token';

    const params = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    };

    const { data: accessTokenResponse } = await axios.post<IAccessTokenResponse>(url, null, { params } ).catch(err => {
      console.error("Erro ao obter token de acesso do Google:", err.response?.data);
      throw new AppError('Falha na autenticação com o Google.', 401);
    });

    const userInfoResponse = await axios.get<IUserResponse>('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessTokenResponse.access_token}`,
      },
    } ).catch(err => {
      console.error("Erro ao obter informações do usuário do Google:", err.response?.data);
      throw new AppError('Falha ao obter informações do usuário do Google.', 401);
    });

    const { id: googleId, email, name } = userInfoResponse.data;

    let user = await prisma.user.findUnique({
      where: { googleId },
      include: { permissions: true },
    });

    if (!user) {
      const userByEmail = await prisma.user.findUnique({ where: { email } });
      if (userByEmail) {
        throw new AppError('Este e-mail já está em uso por uma conta tradicional.', 409);
      }

      user = await prisma.user.create({
        data: {
          googleId,
          name,
          email,
          status: 'PENDENTE',
        },
        include: { permissions: true },
      });
    }

    if (user.status === 'PENDENTE') {
      throw new AppError('Seu cadastro está pendente de aprovação pelo administrador.', 403);
    }
    if (user.status === 'RECUSADO') {
      throw new AppError('Seu acesso foi recusado pelo administrador.', 403);
    }

    const { secret, expiresIn } = authConfig.jwt;
    const userPermissions = user.permissions.map(p => p.action);

    // @ts-ignore
    const token = sign(
      { permissions: userPermissions },
      secret,
      {
        subject: user.id,
        expiresIn: expiresIn,
      }
    );

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { user: userResponse, token };
  }
}
