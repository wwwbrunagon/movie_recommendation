import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	clearRefreshTokenCookie,
	setRefreshTokenCookie,
} from './auth-cookie';
import { REFRESH_TOKEN_COOKIE_NAME } from '../constants/session';

describe('auth-cookie', () => {
	beforeEach(() => {
		process.env.NODE_ENV = 'development';
	});

	it('sets the refresh token cookie for localhost development', () => {
		const cookie = vi.fn();
		const response = {
			cookie,
		} as unknown as Response;

		setRefreshTokenCookie(response, 'refresh-token');

		expect(cookie).toHaveBeenCalledWith(
			REFRESH_TOKEN_COOKIE_NAME,
			'refresh-token',
			expect.objectContaining({
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				path: '/auth',
			}),
		);
	});

	it('clears the refresh token cookie using the same auth path', () => {
		const clearCookie = vi.fn();
		const response = {
			clearCookie,
		} as unknown as Response;

		clearRefreshTokenCookie(response);

		expect(clearCookie).toHaveBeenCalledWith(
			REFRESH_TOKEN_COOKIE_NAME,
			expect.objectContaining({
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				path: '/auth',
			}),
		);
	});
});
