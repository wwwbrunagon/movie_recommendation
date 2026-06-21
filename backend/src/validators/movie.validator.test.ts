import { describe, expect, it } from 'vitest';

import { movieIdSchema, searchMoviesSchema } from './movie.validator';

describe('movie.validator', () => {
	it('accepts a valid search query', () => {
		const result = searchMoviesSchema.parse({
			query: 'Interstellar',
		});

		expect(result).toEqual({
			query: 'Interstellar',
		});
	});

	it('coerces movie id params into a number', () => {
		const result = movieIdSchema.parse({
			id: '42',
		});

		expect(result).toEqual({
			id: 42,
		});
	});

	it('rejects a non-positive movie id', () => {
		const result = movieIdSchema.safeParse({
			id: '0',
		});

		expect(result.success).toBe(false);
	});
});
