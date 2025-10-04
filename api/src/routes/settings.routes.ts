import { Router } from 'express';
// Correção: Importações nomeadas com {}
import { UserSettingsController } from '../controllers/UserSettingsController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const settingsRoutes = Router();
const userSettingsController = new UserSettingsController();

settingsRoutes.use(ensureAuthenticated);

settingsRoutes.get('/', userSettingsController.get);
settingsRoutes.put('/', userSettingsController.update);

export default settingsRoutes;
