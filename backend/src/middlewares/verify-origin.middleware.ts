import { NextFunction, Request, Response } from 'express';

import { getAppConfig } from '../config/app-config';
import { AppError } from '../utils/app-error';

function getRequestOrigin(req: Request) {
	const origin = req.headers.origin;

	if (origin) {
		return origin;
	}

	const referer = req.headers.referer;

	if (!referer) {
		return null;
	}

	try {
		return new URL(referer).origin;
	} catch {
		return null;
	}
}

export function verifyOriginMiddleware(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	const { clientOrigin } = getAppConfig();

	const requestOrigin = getRequestOrigin(req);

	if (requestOrigin !== clientOrigin) {
		return next(AppError.forbidden('Invalid request origin', 'INVALID_ORIGIN'));
	}

	return next();
}
