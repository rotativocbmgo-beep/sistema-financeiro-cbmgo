import { prisma } from '../server';
import axios from 'axios';
import { sign } from 'jsonwebtoken';
import authConfig from '../config/auth';
import { AppError } from '../errors/AppError';
import { CreateActivityLogService } from './CreateActivityLogService'; // 1. IMPORTAR O SERVIÇO DE LOG

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
    const logService = new CreateActivityLogService(); // 2. INSTANCIAR O SERVIÇO
    
    // ... (lógica para obter o token do Google e as informações do usuário permanece a mesma)
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
      headers: { Authorization: `Bearer ${accessTokenResponse.access_token}` },
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
        await logService.execute({ userId: userByEmail.id, action: 'Falha de Login Google: E-mail já cadastrado (conta tradicional)' });
        throw new AppError('Este e-mail já está em uso por uma conta tradicional.', 409);
      }
      user = await prisma.user.create({
        data: { googleId, name, email, status: 'PENDENTE' },
        include: { permissions: true },
      });
      await logService.execute({ userId: user.id, action: 'Criação de conta via Google' });
    }

    if (user.status !== 'ATIVO') {
      const action = `Falha de Login Google: Status do usuário é ${user.status}`;
      await logService.execute({ userId: user.id, action });
      const message = user.status === 'PENDENTE'
        ? 'Seu cadastro está pendente de aprovação pelo administrador.'
        : 'Seu acesso foi recusado pelo administrador.';
      throw new AppError(message, 403);
    }

    // --- Lógica de Log para Sucesso ---
    await logService.execute({
      userId: user.id,
      action: 'Login bem-sucedido com Google',
    });

    const { secret, expiresIn } = authConfig.jwt;
    const userPermissions = user.permissions.map(p => p.action);

    // @ts-ignore
    const token = sign({ permissions: userPermissions }, secret, { subject: user.id, expiresIn });
    const userResponse = { id: user.id, name: user.name, email: user.email };

    return { user: userResponse, token };
  }
}
