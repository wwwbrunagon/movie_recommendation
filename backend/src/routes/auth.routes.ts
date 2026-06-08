import { Router } from 'express';

import { AuthController } from '../controller/auth.controller';
import { validate } from '../middlewares/validate.middleware';

import {
  registerSchema,
  loginSchema,
} from '../validators/auth.validator';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post(
  '/register',
  validate(registerSchema),
  authController.register,
);

authRoutes.post(
  '/login',
  validate(loginSchema),
  authController.login,
);

export { authRoutes };