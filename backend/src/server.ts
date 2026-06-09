import dotenv from 'dotenv';
import app from './app';
import { logError } from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
	console.error('❌ Uncaught Exception:', error);
	logError(error, { type: 'uncaughtException' });
	process.exit(1);
});

// Handle unhandled promise rejections
process.on(
	'unhandledRejection',
	(reason: unknown, promise: Promise<unknown>) => {
		console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
		logError(new Error(String(reason)), { type: 'unhandledRejection' });
		process.exit(1);
	},
);

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('SIGTERM signal received: closing HTTP server');
	server.close(() => {
		console.log('HTTP server closed');
		process.exit(0);
	});
});
