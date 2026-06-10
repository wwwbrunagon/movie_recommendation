import { Router } from 'express';
import { UserController } from '../controller/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

const userController = new UserController();

router.get('/me', authMiddleware, asyncHandler(userController.me));

export default router;
