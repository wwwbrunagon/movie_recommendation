import { api } from '../../../shared/services/api';

import type {
	MovieCreditsResponse,
	MovieDetails,
	MovieSearchResponse,
} from '../types/movie.types';

export const movieService = {
	async searchMovies(query: string): Promise<MovieSearchResponse> {
		const response = await api.get('/movies/search', {
			params: { query },
		});

		return response.data;
	},

	async getMovieDetails(movieId: number): Promise<MovieDetails> {
		const response = await api.get(`/movies/${movieId}`);

		return response.data;
	},

	async getMovieCredits(movieId: number): Promise<MovieCreditsResponse> {
		const response = await api.get(`/movies/${movieId}/credits`);

		return response.data;
	},
};
