import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AUTH_ERRORS } from '../constants/auth-errors';

const authService = new AuthService();

export class AuthController {
	async register(req: Request, res: Response): Promise<Response> {
		try {
			const { name, email, password } = req.body;

			if (!name || !email || !password) {
				return res.status(400).json({
					message: 'Name, email and password are required',
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
					message: 'Email already exists',
				});
			}

			console.error(error);

			return res.status(500).json({
				message: 'Internal server error',
			});
		}
	}

	async login(req: Request, res: Response): Promise<Response> {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				return res.status(400).json({
					message: 'Email and password are required',
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
					message: 'Invalid credentials',
				});
			}

			console.error(error);

			return res.status(500).json({
				message: 'Internal server error',
			});
		}
	}
}
