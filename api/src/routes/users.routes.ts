import { Router } from 'express';
// Correção: Importações nomeadas com {}
import { UsersController } from '../controllers/UsersController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const usersRoutes = Router();
const usersController = new UsersController();

usersRoutes.post('/', usersController.create);

// Exemplo de rota protegida
// usersRoutes.get('/profile', ensureAuthenticated, usersController.show);

export default usersRoutes;
