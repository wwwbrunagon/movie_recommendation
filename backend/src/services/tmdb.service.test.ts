import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetAppConfigForTests } from '../config/app-config';

const { getMock } = vi.hoisted(() => ({
	getMock: vi.fn(),
}));

vi.mock('axios', () => ({
	default: {
		create: vi.fn(() => ({
			get: getMock,
		})),
		isAxiosError: vi.fn(() => true),
	},
}));

import tmdbService from './tmdb.service';

describe('tmdb.service', () => {
	beforeEach(() => {
		resetAppConfigForTests();
		getMock.mockReset();
		process.env.CLIENT_ORIGIN = 'http://localhost:5173';
		process.env.JWT_SECRET = 'secret';
		process.env.TMDB_BASE_URL = 'https://example.test';
		process.env.TMDB_API_KEY = 'tmdb-key';
	});

	it('returns normalized search results from a DTO input', async () => {
		getMock.mockResolvedValue({
			data: {
				page: 1,
				total_pages: 2,
				total_results: 3,
				results: [
					{
						id: 1,
						title: 'Inception',
						overview: 'Dreams inside dreams',
						release_date: '2010-07-16',
						poster_path: '/poster.jpg',
						backdrop_path: '/backdrop.jpg',
						vote_average: 8.8,
						vote_count: 1000,
						popularity: 99.9,
						original_language: 'en',
						genre_ids: [28, 878],
						adult: false,
					},
				],
			},
		});

		const result = await tmdbService.searchMovies({ query: 'Inception' });

		expect(result.results[0]).toEqual({
			id: 1,
			title: 'Inception',
			overview: 'Dreams inside dreams',
			releaseDate: '2010-07-16',
			posterPath: '/poster.jpg',
			backdropPath: '/backdrop.jpg',
			voteAverage: 8.8,
			voteCount: 1000,
			popularity: 99.9,
			originalLanguage: 'en',
			genreIds: [28, 878],
			adult: false,
		});
		expect(result.results[0]).not.toHaveProperty('genre_ids');
	});
});
