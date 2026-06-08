import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';
import { AUTH_MESSAGES } from '../constants/auth-messages';

export const validate =
	(schema: ZodObject, source: 'body' | 'params' | 'query') =>
	(req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req[source]);

		if (!result.success) {
			res.status(400).json({
				message: AUTH_MESSAGES.INVALID_REQUEST_DATA,
				errors: result.error.flatten(),
			});

			return;
		}

		next();
	};
