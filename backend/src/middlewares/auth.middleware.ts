import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { getAppConfig } from '../config/app-config';
import { AppError } from '../utils/app-error';

interface JwtPayload {
	userId: string;
}

export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return next(
			AppError.unauthorized('Token not provided', 'TOKEN_NOT_PROVIDED'),
		);
	}

	const [scheme, token] = authHeader.split(' ');

	if (scheme !== 'Bearer' || !token) {
		return next(
			AppError.unauthorized('Invalid token format', 'INVALID_TOKEN_FORMAT'),
		);
	}

	try {
		const { jwtSecret } = getAppConfig();
		const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

		req.user = {
			userId: decoded.userId,
		};

		next();
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}

		return next(AppError.unauthorized('Invalid token', 'INVALID_TOKEN'));
	}
};
