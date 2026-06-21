import { AppError } from '../utils/app-error';

export interface TmdbConfig {
	baseUrl: string;
	apiKey: string;
}

export interface AppConfig {
	port: number;
	clientOrigin: string;
	jwtSecret: string;
	tmdb: TmdbConfig;
}

let cachedConfig: AppConfig | null = null;

function getRequiredEnv(rawValue: string | undefined, key: string): string {
	const value = rawValue?.trim();

	if (!value) {
		throw AppError.internalServerError(
			`Missing required environment variable: ${key}`,
			'ENV_CONFIGURATION_ERROR',
		);
	}

	return value;
}

function getUrlEnv(rawValue: string | undefined, key: string): string {
	const value = getRequiredEnv(rawValue, key);

	try {
		new URL(value);
		return value;
	} catch {
		throw AppError.internalServerError(
			`Invalid URL in environment variable: ${key}`,
			'ENV_CONFIGURATION_ERROR',
		);
	}
}

function getPortEnv(rawValue: string | undefined): number {
	if (!rawValue?.trim()) {
		return 3000;
	}

	const port = Number(rawValue);

	if (!Number.isInteger(port) || port <= 0) {
		throw AppError.internalServerError(
			'Invalid PORT environment variable',
			'ENV_CONFIGURATION_ERROR',
		);
	}

	return port;
}

export function loadAppConfig(
	env: NodeJS.ProcessEnv = process.env,
): AppConfig {
	return {
		port: getPortEnv(env.PORT),
		clientOrigin: getUrlEnv(env.CLIENT_ORIGIN, 'CLIENT_ORIGIN'),
		jwtSecret: getRequiredEnv(env.JWT_SECRET, 'JWT_SECRET'),
		tmdb: {
			baseUrl: getUrlEnv(env.TMDB_BASE_URL, 'TMDB_BASE_URL'),
			apiKey: getRequiredEnv(env.TMDB_API_KEY, 'TMDB_API_KEY'),
		},
	};
}

export function getAppConfig(): AppConfig {
	if (!cachedConfig) {
		cachedConfig = loadAppConfig();
	}

	return cachedConfig;
}

export function resetAppConfigForTests(): void {
	cachedConfig = null;
}
