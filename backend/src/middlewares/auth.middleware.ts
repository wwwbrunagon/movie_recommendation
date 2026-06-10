import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
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

	const jwtSecret = process.env.JWT_SECRET;

	if (!jwtSecret) {
		return next(
			AppError.internalServerError(
				'JWT_SECRET is not configured',
				'JWT_SECRET_NOT_CONFIGURED',
			),
		);
	}

	try {
		const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

		req.user = {
			userId: decoded.userId,
		};

		next();
	} catch {
		return next(AppError.unauthorized('Invalid token', 'INVALID_TOKEN'));
	}
};
