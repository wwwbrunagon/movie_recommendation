import { describe, expect, it } from 'vitest';

import {
	toAuthenticatedUserDto,
	toAuthSessionResponseDto,
} from './auth.mapper';

describe('auth.mapper', () => {
	it('maps authenticated users without internal fields', () => {
		const result = toAuthenticatedUserDto({
			id: 'user-1',
			name: 'Jane Doe',
			email: 'jane@example.com',
		});

		expect(result).toEqual({
			id: 'user-1',
			name: 'Jane Doe',
			email: 'jane@example.com',
		});
	});

	it('removes refreshToken from the session response DTO', () => {
		const result = toAuthSessionResponseDto({
			accessToken: 'access-token',
			refreshToken: 'refresh-token',
			user: {
				id: 'user-1',
				name: 'Jane Doe',
				email: 'jane@example.com',
			},
		});

		expect(result).toEqual({
			accessToken: 'access-token',
			user: {
				id: 'user-1',
				name: 'Jane Doe',
				email: 'jane@example.com',
			},
		});
		expect(result).not.toHaveProperty('refreshToken');
	});
});
