import jwt from 'jsonwebtoken';
import { AppError } from './app-error';
import { ACCESS_TOKEN_EXPIRES_IN } from '../constants/session';

export function generateAccessToken(userId: string) {
	const jwtSecret = process.env.JWT_SECRET;

	if (!jwtSecret) {
		throw AppError.internalServerError(
			'JWT_SECRET is not configured',
			'JWT_SECRET_NOT_CONFIGURED',
		);
	}

	return jwt.sign({ userId }, jwtSecret, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}
