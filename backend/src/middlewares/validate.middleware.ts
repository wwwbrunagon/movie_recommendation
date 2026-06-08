import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';

export const validate =
	(schema: ZodObject, source: 'body' | 'params' | 'query') =>
	(req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req[source]);

		if (!result.success) {
			res.status(400).json({
				message: 'Validation error',
				errors: result.error.flatten(),
			});

			return;
		}

		next();
	};
