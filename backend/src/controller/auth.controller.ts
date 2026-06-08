import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
	async register(req: Request, res: Response): Promise<Response> {
		try {
			const { name, email, password } = req.body;

			const result = await authService.register(name, email, password);

			return res.status(201).json(result);
		} catch (error) {
			if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
				return res.status(409).json({
					message: 'Email already exists',
				});
			}

			console.error('Register error:', error);

			return res.status(500).json({
				message: 'Internal server error',
			});
		}
	}

	async login(req: Request, res: Response): Promise<Response> {
		try {
			const { email, password } = req.body;

			const result = await authService.login(email, password);

			return res.status(200).json(result);
		} catch (error) {
			console.error('Login error:', error);

			return res.status(401).json({
				message: 'Invalid credentials',
			});
		}
	}
}
