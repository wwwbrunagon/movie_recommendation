import { Router } from 'express';
import { UserController } from '../controller/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

const userController = new UserController();

router.get('/me', authMiddleware, userController.me);

export default router;
