import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
	async register(req: Request, res: Response): Promise<Response> {
		const { name, email, password } = req.body;
		const result = await authService.register(name, email, password);

		return res.status(201).json(result);
	}

	async login(req: Request, res: Response): Promise<Response> {
		const { email, password } = req.body;
		const result = await authService.login(email, password);

		return res.status(200).json(result);
	}
}
