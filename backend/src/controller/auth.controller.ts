import { Request, Response } from 'express';

import {
	type LoginUserInputDto,
	type RegisterUserInputDto,
} from '../modules/auth/auth.dto';
import { toAuthSessionResponseDto } from '../modules/auth/auth.mapper';
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
		const input = req.validated?.body as RegisterUserInputDto;
		const result = await authService.register(input);

		setRefreshTokenCookie(res, result.refreshToken);

		return res.status(201).json(toAuthSessionResponseDto(result));
	}

	async login(req: Request, res: Response): Promise<Response> {
		const input = req.validated?.body as LoginUserInputDto;
		const result = await authService.login(input);

		setRefreshTokenCookie(res, result.refreshToken);

		return res.status(200).json(toAuthSessionResponseDto(result));
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

		setRefreshTokenCookie(res, result.refreshToken);

		return res.status(200).json(toAuthSessionResponseDto(result));
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
