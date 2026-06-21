import type { Request, Response } from 'express';
import { describe, expect, it } from 'vitest';

import { AuthController } from './auth.controller';
import { REFRESH_TOKEN_COOKIE_NAME } from '../constants/session';

describe('AuthController', () => {
	it('returns a specific unauthorized error when refresh cookie is missing', async () => {
		const controller = new AuthController();
		const req = {
			cookies: {},
		} as Request;
		const res = {} as Response;

		await expect(controller.refresh(req, res)).rejects.toMatchObject({
			statusCode: 401,
			errorCode: 'REFRESH_TOKEN_NOT_PROVIDED',
		});
	});

	it('reads the refresh token from the expected cookie name', () => {
		expect(REFRESH_TOKEN_COOKIE_NAME).toBe('refreshToken');
	});
});
