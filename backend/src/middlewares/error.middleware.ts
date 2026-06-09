import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error';
import { logError } from '../utils/logger';

interface ErrorResponse {
	success: false;
	message: string;
	code: string;
	errors?: Record<string, string[]>;
}

/**
 * Maps Prisma error codes to HTTP status codes
 */
function getPrismaStatusCode(code: string): number {
	const prismaStatusMap: Record<string, number> = {
		P2025: 404, // Record to update/delete does not exist
		P2002: 409, // Unique constraint failed
		P2014: 400, // Required relation violation
		P2003: 400, // Foreign key constraint failed
		P2013: 400, // Missing required argument
	};

	return prismaStatusMap[code] || 500;
}

/**
 * Checks if error is a Prisma error
 */
function isPrismaError(
	error: unknown,
): error is { code?: string; meta?: unknown } {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		typeof (error as Record<string, unknown>).code === 'string'
	);
}

/**
 * Global error handling middleware
 * Must be registered AFTER all routes
 */
export const errorMiddleware = (
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	// Create error response object
	let response: ErrorResponse = {
		success: false,
		message: 'Internal server error',
		code: 'INTERNAL_SERVER_ERROR',
	};

	let statusCode = 500;

	// Handle AppError
	if (err instanceof AppError) {
		statusCode = err.statusCode;
		response = {
			success: false,
			message: err.message,
			code: err.errorCode,
		};

		logError(err, {
			endpoint: `${req.method} ${req.path}`,
			userId: req.user?.userId,
		});
	}
	// Handle Zod validation errors
	else if (err instanceof ZodError) {
		statusCode = 400;

		const fieldErrors: Record<string, string[]> = {};
		const flattened = err.flatten();

		if (flattened.fieldErrors) {
			Object.entries(flattened.fieldErrors).forEach(([field, messages]) => {
				fieldErrors[field] = (messages as string[]) || [];
			});
		}

		response = {
			success: false,
			message: 'Validation error',
			code: 'VALIDATION_ERROR',
			errors: fieldErrors,
		};

		logError(err, {
			endpoint: `${req.method} ${req.path}`,
			userId: req.user?.userId,
		});
	}
	// Handle Prisma errors
	else if (isPrismaError(err)) {
		const prismaCode = err.code || 'UNKNOWN';
		statusCode = getPrismaStatusCode(prismaCode);

		const prismaErrorMap: Record<string, string> = {
			P2025: 'Record not found',
			P2002: 'A unique constraint would be violated on this operation',
			P2014: 'Required relation violation',
			P2003: 'Foreign key constraint failed',
			P2013: 'Missing required argument',
		};

		response = {
			success: false,
			message: prismaErrorMap[prismaCode] || 'Database error',
			code: `PRISMA_${prismaCode}`,
		};

		logError(err, {
			endpoint: `${req.method} ${req.path}`,
			userId: req.user?.userId,
			prismaCode,
		});
	}
	// Handle standard Error
	else if (err instanceof Error) {
		response = {
			success: false,
			message: err.message,
			code: 'INTERNAL_SERVER_ERROR',
		};

		logError(err, {
			endpoint: `${req.method} ${req.path}`,
			userId: req.user?.userId,
		});
	}
	// Handle unknown errors
	else {
		response = {
			success: false,
			message: 'An unexpected error occurred',
			code: 'INTERNAL_SERVER_ERROR',
		};

		logError(new Error(String(err)), {
			endpoint: `${req.method} ${req.path}`,
			userId: req.user?.userId,
		});
	}

	res.status(statusCode).json(response);
};
