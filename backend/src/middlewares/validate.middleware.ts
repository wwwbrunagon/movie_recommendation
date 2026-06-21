import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export const validate =
	(schema: ZodType, source: 'body' | 'params' | 'query') =>
	(req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req[source]);

		if (!result.success) {
			return next(result.error);
		}

		req.validated = {
			...req.validated,
			[source]: result.data,
		};

		next();
	};
