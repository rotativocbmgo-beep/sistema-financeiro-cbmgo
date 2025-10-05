// api/src/routes/google.routes.ts

import { Router } from 'express';
import { GoogleAuthController } from '../controllers/GoogleAuthController';

const googleRoutes = Router();
const googleAuthController = new GoogleAuthController();

// Rota que receberá o 'code' do frontend após o login do usuário no Google
googleRoutes.post('/callback', googleAuthController.handle);

export default googleRoutes;
