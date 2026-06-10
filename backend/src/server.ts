import 'dotenv/config';
import app from './app';
import { AppError } from './utils/app-error';
import { logError } from './utils/logger';

const PORT = process.env.PORT || 3000;
const SHUTDOWN_TIMEOUT_MS = 10_000;
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

const server = app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

const normalizeError = (error: unknown): Error => {
	if (error instanceof Error) {
		return error;
	}

	return new Error(String(error));
};

const shutdown = (exitCode: number): void => {
	const timeout = setTimeout(() => {
		logError(
			AppError.internalServerError(
				'Forced shutdown after timeout',
				'FORCED_SHUTDOWN_TIMEOUT',
			),
			{ type: 'shutdown' },
		);
		process.exit(EXIT_FAILURE);
	}, SHUTDOWN_TIMEOUT_MS);

	server.close((error?: Error) => {
		clearTimeout(timeout);

		if (error) {
			logError(error, { type: 'shutdown' });
			process.exit(EXIT_FAILURE);
		}

		console.log('HTTP server closed');
		process.exit(exitCode);
	});
};

server.on('error', (error: Error) => {
	logError(error, { type: 'serverError' });
	process.exit(EXIT_FAILURE);
});

process.on('uncaughtException', (error: Error) => {
	logError(error, { type: 'uncaughtException' });
	shutdown(EXIT_FAILURE);
});

process.on('unhandledRejection', (reason: unknown) => {
	logError(normalizeError(reason), { type: 'unhandledRejection' });
	shutdown(EXIT_FAILURE);
});

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('SIGTERM signal received: closing HTTP server');
	shutdown(EXIT_SUCCESS);
});
