import { Router } from 'express';
import { UserSettingsController } from '../controllers/UserSettingsController';

const settingsRouter = Router();
const userSettingsController = new UserSettingsController();

// Rota para buscar as configurações do usuário logado
settingsRouter.get('/', userSettingsController.get);

// Rota para atualizar as configurações do usuário logado
settingsRouter.put('/', userSettingsController.update);

export default settingsRouter;
