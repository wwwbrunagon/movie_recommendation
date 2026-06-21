import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';

describe('UserService', () => {
	const userService = new UserService();

	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('returns the public user profile DTO', async () => {
		vi.spyOn(UserRepository.prototype, 'findProfileById').mockResolvedValue({
			id: 'user-1',
			name: 'Jane Doe',
			email: 'jane@example.com',
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
		} as never);

		const result = await userService.getProfile('user-1');

		expect(result).toEqual({
			id: 'user-1',
			name: 'Jane Doe',
			email: 'jane@example.com',
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
		});
		expect(result).not.toHaveProperty('password');
	});
});
