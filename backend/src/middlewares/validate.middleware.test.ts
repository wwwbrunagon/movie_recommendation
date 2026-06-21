import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { validate } from './validate.middleware';
import { searchMoviesSchema } from '../validators/movie.validator';

describe('validate.middleware', () => {
	it('stores parsed query data in req.validated without overwriting req.query', () => {
		const middleware = validate(searchMoviesSchema, 'query');
		const next = vi.fn();
		const req = {
			query: {
				query: 'batman',
			},
		} as unknown as Request;
		const res = {} as Response;

		middleware(req, res, next);

		expect(req.validated?.query).toEqual({
			query: 'batman',
		});
		expect(req.query).toEqual({
			query: 'batman',
		});
		expect(next).toHaveBeenCalledWith();
	});

	it('forwards validation errors to next', () => {
		const middleware = validate(searchMoviesSchema, 'query');
		const next = vi.fn();
		const req = {
			query: {},
		} as unknown as Request;
		const res = {} as Response;

		middleware(req, res, next as NextFunction);

		expect(next).toHaveBeenCalledTimes(1);
		expect(next.mock.calls[0]?.[0]).toBeDefined();
	});
});
