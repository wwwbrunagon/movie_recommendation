export class AppError extends Error {
	public readonly statusCode: number;
	public readonly errorCode: string;
	public readonly isOperational: boolean;

	constructor(
		message: string,
		statusCode: number,
		errorCode: string,
		isOperational: boolean = true,
	) {
		super(message);
		Object.setPrototypeOf(this, AppError.prototype);

		this.statusCode = statusCode;
		this.errorCode = errorCode;
		this.isOperational = isOperational;

		Error.captureStackTrace(this, this.constructor);
	}

	// Client error (4xx)
	static badRequest(
		message: string,
		errorCode: string = 'BAD_REQUEST',
	): AppError {
		return new AppError(message, 400, errorCode);
	}

	static unauthorized(
		message: string = 'Unauthorized',
		errorCode: string = 'UNAUTHORIZED',
	): AppError {
		return new AppError(message, 401, errorCode);
	}

	static forbidden(
		message: string = 'Forbidden',
		errorCode: string = 'FORBIDDEN',
	): AppError {
		return new AppError(message, 403, errorCode);
	}

	static notFound(
		message: string = 'Not found',
		errorCode: string = 'NOT_FOUND',
	): AppError {
		return new AppError(message, 404, errorCode);
	}

	static conflict(message: string, errorCode: string = 'CONFLICT'): AppError {
		return new AppError(message, 409, errorCode);
	}

	static unprocessableEntity(
		message: string,
		errorCode: string = 'UNPROCESSABLE_ENTITY',
	): AppError {
		return new AppError(message, 422, errorCode);
	}

	// Server error (5xx)
	static internalServerError(
		message: string = 'Internal server error',
		errorCode: string = 'INTERNAL_SERVER_ERROR',
	): AppError {
		return new AppError(message, 500, errorCode, true);
	}

	static serviceUnavailable(
		message: string = 'Service unavailable',
		errorCode: string = 'SERVICE_UNAVAILABLE',
	): AppError {
		return new AppError(message, 503, errorCode, true);
	}
}
