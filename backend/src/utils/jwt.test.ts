import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetAppConfigForTests } from '../config/app-config';
import { generateAccessToken } from './jwt';

vi.mock('jsonwebtoken', () => ({
	default: {
		sign: vi.fn(() => 'signed-token'),
	},
}));

describe('jwt', () => {
	beforeEach(() => {
		resetAppConfigForTests();
		process.env.CLIENT_ORIGIN = 'http://localhost:5173';
		process.env.JWT_SECRET = 'secret';
		process.env.TMDB_BASE_URL = 'https://api.themoviedb.org/3';
		process.env.TMDB_API_KEY = 'tmdb-key';
		process.env.PORT = '3000';
	});

	it('uses the centralized app config when generating access tokens', () => {
		const token = generateAccessToken('user-1');

		expect(token).toBe('signed-token');
		expect(jwt.sign).toHaveBeenCalledWith(
			{ userId: 'user-1' },
			'secret',
			expect.objectContaining({ expiresIn: expect.any(String) }),
		);
	});
});
