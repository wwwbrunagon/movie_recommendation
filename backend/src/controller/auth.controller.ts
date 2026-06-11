import { Request, Response } from 'express';

import { AuthService } from '../services/auth.service';
import { REFRESH_TOKEN_COOKIE_NAME } from '../constants/session';
import {
	clearRefreshTokenCookie,
	setRefreshTokenCookie,
} from '../utils/auth-cookie';
import { AppError } from '../utils/app-error';

const authService = new AuthService();

export class AuthController {
	async register(req: Request, res: Response): Promise<Response> {
		const { name, email, password } = req.body;
		const result = await authService.register(name, email, password);
		const { refreshToken, ...responseBody } = result;

		setRefreshTokenCookie(res, refreshToken);

		return res.status(201).json(responseBody);
	}

	async login(req: Request, res: Response): Promise<Response> {
		const { email, password } = req.body;
		const result = await authService.login(email, password);
		const { refreshToken, ...responseBody } = result;

		setRefreshTokenCookie(res, refreshToken);

		return res.status(200).json(responseBody);
	}

	async refresh(req: Request, res: Response): Promise<Response> {
		const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

		if (!refreshToken) {
			throw AppError.unauthorized(
				'Refresh token not provided',
				'REFRESH_TOKEN_NOT_PROVIDED',
			);
		}

		const result = await authService.refresh(refreshToken);
		const { refreshToken: nextRefreshToken, ...responseBody } = result;

		setRefreshTokenCookie(res, nextRefreshToken);

		return res.status(200).json(responseBody);
	}

	async logout(req: Request, res: Response): Promise<Response> {
		const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

		if (refreshToken) {
			await authService.logout(refreshToken);
		}

		clearRefreshTokenCookie(res);

		return res.status(204).send();
	}
}
