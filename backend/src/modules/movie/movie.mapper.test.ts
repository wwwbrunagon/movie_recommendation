import { describe, expect, it } from 'vitest';

import {
	toMovieCreditsDto,
	toMovieDetailsDto,
	toMovieSearchResponseDto,
} from './movie.mapper';

describe('movie.mapper', () => {
	it('normalizes search responses from TMDB', () => {
		const result = toMovieSearchResponseDto({
			page: 1,
			total_pages: 10,
			total_results: 100,
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
		});

		expect(result).toEqual({
			page: 1,
			totalPages: 10,
			totalResults: 100,
			results: [
				{
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
				},
			],
		});
		expect(result.results[0]).not.toHaveProperty('poster_path');
	});

	it('normalizes movie details and strips TMDB field casing', () => {
		const result = toMovieDetailsDto({
			id: 1,
			title: 'Inception',
			overview: 'Dreams inside dreams',
			release_date: '2010-07-16',
			runtime: 148,
			poster_path: '/poster.jpg',
			backdrop_path: '/backdrop.jpg',
			vote_average: 8.8,
			vote_count: 1000,
			popularity: 99.9,
			original_language: 'en',
			status: 'Released',
			tagline: 'Your mind is the scene of the crime.',
			genres: [{ id: 878, name: 'Science Fiction' }],
			adult: false,
		});

		expect(result).toEqual({
			id: 1,
			title: 'Inception',
			overview: 'Dreams inside dreams',
			releaseDate: '2010-07-16',
			runtime: 148,
			posterPath: '/poster.jpg',
			backdropPath: '/backdrop.jpg',
			voteAverage: 8.8,
			voteCount: 1000,
			popularity: 99.9,
			originalLanguage: 'en',
			status: 'Released',
			tagline: 'Your mind is the scene of the crime.',
			genres: [{ id: 878, name: 'Science Fiction' }],
			adult: false,
		});
		expect(result).not.toHaveProperty('release_date');
	});

	it('normalizes movie credits and strips raw profile_path fields', () => {
		const result = toMovieCreditsDto({
			id: 1,
			cast: [
				{
					id: 10,
					name: 'Leonardo DiCaprio',
					character: 'Cobb',
					profile_path: '/leo.jpg',
					order: 0,
				},
			],
			crew: [
				{
					id: 20,
					name: 'Christopher Nolan',
					job: 'Director',
					department: 'Directing',
					profile_path: '/nolan.jpg',
				},
			],
		});

		expect(result).toEqual({
			id: 1,
			cast: [
				{
					id: 10,
					name: 'Leonardo DiCaprio',
					character: 'Cobb',
					profilePath: '/leo.jpg',
					order: 0,
				},
			],
			crew: [
				{
					id: 20,
					name: 'Christopher Nolan',
					job: 'Director',
					department: 'Directing',
					profilePath: '/nolan.jpg',
				},
			],
		});
		expect(result.cast[0]).not.toHaveProperty('profile_path');
	});
});
