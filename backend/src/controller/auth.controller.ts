import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AUTH_ERRORS } from '../constants/auth-errors';
import { AUTH_MESSAGES } from '../constants/auth-messages';

const authService = new AuthService();

export class AuthController {
	async register(req: Request, res: Response): Promise<Response> {
		try {
			const { name, email, password } = req.body;

			if (!name || !email || !password) {
				return res.status(400).json({
					message: AUTH_MESSAGES.INVALID_REQUEST_DATA,
				});
			}

			const result = await authService.register(name, email, password);

			return res.status(201).json(result);
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === AUTH_ERRORS.USER_ALREADY_EXISTS
			) {
				return res.status(409).json({
					message: AUTH_MESSAGES.USER_ALREADY_EXISTS,
				});
			}

			console.error(error);

			return res.status(500).json({
				message: AUTH_MESSAGES.REGISTER_UNAVAILABLE,
			});
		}
	}

	async login(req: Request, res: Response): Promise<Response> {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				return res.status(400).json({
					message: AUTH_MESSAGES.INVALID_REQUEST_DATA,
				});
			}

			const result = await authService.login(email, password);

			return res.status(200).json(result);
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === AUTH_ERRORS.INVALID_CREDENTIALS
			) {
				return res.status(401).json({
					message: AUTH_MESSAGES.INVALID_CREDENTIALS,
				});
			}

			console.error(error);

			return res.status(500).json({
				message: AUTH_MESSAGES.LOGIN_UNAVAILABLE,
			});
		}
	}
}
