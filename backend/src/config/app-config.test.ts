import { describe, expect, it } from 'vitest';

import { loadAppConfig } from './app-config';

describe('app-config', () => {
	it('rejects a missing required environment variable', () => {
		expect(() =>
			loadAppConfig({
				PORT: '3000',
				CLIENT_ORIGIN: 'http://localhost:5173',
				JWT_SECRET: 'secret',
				TMDB_BASE_URL: 'https://api.themoviedb.org/3',
			}),
		).toThrowError(/TMDB_API_KEY/);
	});

	it('rejects an empty required environment variable', () => {
		expect(() =>
			loadAppConfig({
				PORT: '3000',
				CLIENT_ORIGIN: 'http://localhost:5173',
				JWT_SECRET: 'secret',
				TMDB_BASE_URL: 'https://api.themoviedb.org/3',
				TMDB_API_KEY: '   ',
			}),
		).toThrowError(/TMDB_API_KEY/);
	});

	it('rejects an invalid TMDB_BASE_URL', () => {
		expect(() =>
			loadAppConfig({
				PORT: '3000',
				CLIENT_ORIGIN: 'http://localhost:5173',
				JWT_SECRET: 'secret',
				TMDB_BASE_URL: 'not-a-url',
				TMDB_API_KEY: 'tmdb-key',
			}),
		).toThrowError(/TMDB_BASE_URL/);
	});

	it('returns normalized config for valid environment variables', () => {
		expect(
			loadAppConfig({
				PORT: '4000',
				CLIENT_ORIGIN: 'http://localhost:5173',
				JWT_SECRET: 'secret',
				TMDB_BASE_URL: 'https://api.themoviedb.org/3',
				TMDB_API_KEY: 'tmdb-key',
			}),
		).toEqual({
			port: 4000,
			clientOrigin: 'http://localhost:5173',
			jwtSecret: 'secret',
			tmdb: {
				baseUrl: 'https://api.themoviedb.org/3',
				apiKey: 'tmdb-key',
			},
		});
	});
});
