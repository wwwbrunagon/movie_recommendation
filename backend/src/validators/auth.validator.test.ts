import { describe, expect, it } from 'vitest';

import { loginSchema, registerSchema } from './auth.validator';

describe('auth.validator', () => {
	it('accepts a valid register payload', () => {
		const result = registerSchema.safeParse({
			name: 'Jane Doe',
			email: 'jane@example.com',
			password: 'secret123',
		});

		expect(result.success).toBe(true);
	});

	it('rejects an invalid login payload', () => {
		const result = loginSchema.safeParse({
			email: 'invalid-email',
			password: '123',
		});

		expect(result.success).toBe(false);
	});
});
