import bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from './auth.service';
import { UserRepository } from '../repositories/user.repository';
import { RefreshSessionRepository } from '../repositories/refresh-session.repository';

vi.mock('bcrypt', () => ({
	default: {
		hash: vi.fn(),
		compare: vi.fn(),
	},
}));

vi.mock('../utils/jwt', () => ({
	generateAccessToken: vi.fn(() => 'access-token'),
}));

vi.mock('../utils/refresh-token', () => ({
	generateRefreshToken: vi.fn(() => 'refresh-token'),
	hashRefreshToken: vi.fn(() => 'hashed-refresh-token'),
	getRefreshTokenExpiresAt: vi.fn(() => new Date('2026-01-01T00:00:00.000Z')),
}));

describe('AuthService', () => {
	const authService = new AuthService();

	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('registers using a DTO object and returns a sanitized auth session', async () => {
		vi.spyOn(UserRepository.prototype, 'findByEmail').mockResolvedValue(null);
		vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
		vi.spyOn(UserRepository.prototype, 'create').mockResolvedValue({
			id: 'user-1',
			name: 'Jane Doe',
			email: 'jane@example.com',
			password: 'hashed-password',
		} as never);
		const createSessionSpy = vi
			.spyOn(RefreshSessionRepository.prototype, 'create')
			.mockResolvedValue({} as never);

		const result = await authService.register({
			name: 'Jane Doe',
			email: 'jane@example.com',
			password: 'secret123',
		});

		expect(result).toEqual({
			accessToken: 'access-token',
			refreshToken: 'refresh-token',
			user: {
				id: 'user-1',
				name: 'Jane Doe',
				email: 'jane@example.com',
			},
		});
		expect(result.user).not.toHaveProperty('password');
		expect(createSessionSpy).toHaveBeenCalledWith(
			'user-1',
			'hashed-refresh-token',
			new Date('2026-01-01T00:00:00.000Z'),
		);
	});

	it('logs in using a DTO object and returns a sanitized auth session', async () => {
		vi.spyOn(UserRepository.prototype, 'findByEmail').mockResolvedValue({
			id: 'user-1',
			name: 'Jane Doe',
			email: 'jane@example.com',
			password: 'hashed-password',
		} as never);
		vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
		vi.spyOn(RefreshSessionRepository.prototype, 'create').mockResolvedValue(
			{} as never,
		);

		const result = await authService.login({
			email: 'jane@example.com',
			password: 'secret123',
		});

		expect(result).toEqual({
			accessToken: 'access-token',
			refreshToken: 'refresh-token',
			user: {
				id: 'user-1',
				name: 'Jane Doe',
				email: 'jane@example.com',
			},
		});
		expect(result).not.toHaveProperty('tokenHash');
	});
});
