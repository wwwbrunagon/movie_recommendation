import jwt from 'jsonwebtoken';
import { getAppConfig } from '../config/app-config';
import { ACCESS_TOKEN_EXPIRES_IN } from '../constants/session';

export function generateAccessToken(userId: string) {
	const { jwtSecret } = getAppConfig();

	return jwt.sign({ userId }, jwtSecret, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}
