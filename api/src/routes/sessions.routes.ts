import { Router } from 'express';
// Correção: Importação nomeada com {}
import { SessionsController } from '../controllers/SessionsController';

const sessionsRoutes = Router();
const sessionsController = new SessionsController();

sessionsRoutes.post('/', sessionsController.create);

export default sessionsRoutes;
