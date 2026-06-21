import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import movieController from './movie.controller';
import tmdbService from '../services/tmdb.service';

describe('movie.controller', () => {
	it('reads validated query data for movie search', async () => {
		const req = {
			validated: {
				query: {
					query: 'batman',
				},
			},
		} as Request;
		const json = vi.fn();
		const status = vi.fn(() => ({ json }));
		const res = {
			status,
		} as unknown as Response;
		const serviceSpy = vi
			.spyOn(tmdbService, 'searchMovies')
			.mockResolvedValue({
				page: 1,
				totalPages: 1,
				totalResults: 1,
				results: [],
			});

		await movieController.searchMovies(req, res);

		expect(serviceSpy).toHaveBeenCalledWith({
			query: 'batman',
		});
		expect(status).toHaveBeenCalledWith(200);
		expect(json).toHaveBeenCalledWith({
			page: 1,
			totalPages: 1,
			totalResults: 1,
			results: [],
		});
	});
});
