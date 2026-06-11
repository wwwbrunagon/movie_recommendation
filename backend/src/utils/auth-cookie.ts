import { CookieOptions, Response } from 'express';

import {
	REFRESH_TOKEN_COOKIE_NAME,
	REFRESH_TOKEN_TTL_DAYS,
} from '../constants/session';

const refreshTokenMaxAge = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

function getRefreshTokenCookieOptions(): CookieOptions {
	return {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/auth',
		maxAge: refreshTokenMaxAge,
	};
}

export function setRefreshTokenCookie(res: Response, refreshToken: string) {
	res.cookie(
		REFRESH_TOKEN_COOKIE_NAME,
		refreshToken,
		getRefreshTokenCookieOptions(),
	);
}

export function clearRefreshTokenCookie(res: Response) {
	res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
		...getRefreshTokenCookieOptions(),
		maxAge: undefined,
	});
}
