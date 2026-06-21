import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetAppConfigForTests } from '../config/app-config';
import { startServer } from './start-server';

describe('start-server', () => {
	beforeEach(() => {
		resetAppConfigForTests();
	});

	it('fails before opening the server when config is invalid', () => {
		delete process.env.TMDB_API_KEY;
		process.env.CLIENT_ORIGIN = 'http://localhost:5173';
		process.env.JWT_SECRET = 'secret';
		process.env.TMDB_BASE_URL = 'https://api.themoviedb.org/3';

		const listen = vi.fn();
		const app = { listen } as never;

		expect(() => startServer(app)).toThrow();
		expect(listen).not.toHaveBeenCalled();
	});
});
