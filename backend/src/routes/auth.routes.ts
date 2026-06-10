import { Router } from 'express';

import { AuthController } from '../controller/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/async-handler';

import {
	registerSchema,
	loginSchema,
} from '../validators/auth.validator';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post(
	'/register',
	validate(registerSchema, 'body'),
	asyncHandler(authController.register),
);

authRoutes.post(
	'/login',
	validate(loginSchema, 'body'),
	asyncHandler(authController.login),
);

export { authRoutes };
