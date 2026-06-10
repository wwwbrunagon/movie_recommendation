import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';

export const validate =
	(schema: ZodObject, source: 'body' | 'params' | 'query') =>
	(req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req[source]);

		if (!result.success) {
			return next(result.error);
		}

		next();
	};
