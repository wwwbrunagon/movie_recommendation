import crypto from 'crypto';

import { REFRESH_TOKEN_TTL_DAYS } from '../constants/session';

export function generateRefreshToken() {
	return crypto.randomBytes(64).toString('hex');
}

export function hashRefreshToken(token: string) {
	return crypto.createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenExpiresAt() {
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

	return expiresAt;
}
