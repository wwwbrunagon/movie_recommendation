import { AppError } from './app-error';

interface ErrorContext {
	endpoint?: string;
	userId?: string;
	method?: string;
	[key: string]: unknown;
}

/**
 * Logs errors with context while sanitizing sensitive information
 * @param error - The error to log
 * @param context - Additional context information (endpoint, userId, etc.)
 */
export function logError(error: unknown, context?: ErrorContext): void {
	const timestamp = new Date().toISOString();

	if (error instanceof AppError) {
		const logData = {
			timestamp,
			type: 'AppError',
			statusCode: error.statusCode,
			errorCode: error.errorCode,
			message: error.message,
			isOperational: error.isOperational,
			context,
			stack: error.stack,
		};

		if (error.isOperational) {
			console.warn('[AppError]', JSON.stringify(logData, null, 2));
		} else {
			console.error(
				'[AppError - Unexpected]',
				JSON.stringify(logData, null, 2),
			);
		}
	} else if (error instanceof SyntaxError) {
		const logData = {
			timestamp,
			type: 'SyntaxError',
			message: error.message,
			context,
			stack: error.stack,
		};

		console.error('[SyntaxError]', JSON.stringify(logData, null, 2));
	} else if (error instanceof TypeError) {
		const logData = {
			timestamp,
			type: 'TypeError',
			message: error.message,
			context,
			stack: error.stack,
		};

		console.error('[TypeError]', JSON.stringify(logData, null, 2));
	} else {
		const message = error instanceof Error ? error.message : String(error);
		const stack = error instanceof Error ? error.stack : undefined;

		const logData = {
			timestamp,
			type: 'UnknownError',
			message,
			context,
			stack,
		};

		console.error('[UnknownError]', JSON.stringify(logData, null, 2));
	}
}

/**
 * Sanitizes error details to prevent logging sensitive information
 * @param data - The data to sanitize
 * @returns Sanitized data
 */
function sanitizeError(data: Record<string, unknown>): Record<string, unknown> {
	const sensitiveKeys = [
		'password',
		'token',
		'authorization',
		'secret',
		'apiKey',
		'api_key',
	];
	const sanitized = { ...data };

	for (const key of sensitiveKeys) {
		if (key in sanitized) {
			sanitized[key] = '[REDACTED]';
		}
	}

	return sanitized;
}
