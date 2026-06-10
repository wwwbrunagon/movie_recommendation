import axios from 'axios';
import { AppError } from '../utils/app-error';

const tmdbApi = axios.create();

class TmdbService {
	private getRequestConfig() {
		const baseURL = process.env.TMDB_BASE_URL;
		const apiKey = process.env.TMDB_API_KEY;

		if (!baseURL || !apiKey) {
			throw AppError.internalServerError(
				'TMDB configuration is missing',
				'TMDB_CONFIGURATION_ERROR',
			);
		}

		return {
			baseURL,
			params: {
				api_key: apiKey,
				language: 'en-US',
			},
		};
	}

	private handleTmdbError(error: unknown): never {
		if (axios.isAxiosError(error)) {
			if (error.response?.status === 404) {
				throw AppError.notFound('Movie not found', 'MOVIE_NOT_FOUND');
			}

			throw AppError.serviceUnavailable(
				'TMDB service unavailable',
				'TMDB_SERVICE_UNAVAILABLE',
			);
		}

		throw error;
	}

	async searchMovies(query: string) {
		const config = this.getRequestConfig();

		try {
			const response = await tmdbApi.get('/search/movie', {
				...config,
				params: { ...config.params, query },
			});

			return response.data;
		} catch (error) {
			this.handleTmdbError(error);
		}
	}

	async getMovieDetails(movieId: number) {
		const config = this.getRequestConfig();

		try {
			const response = await tmdbApi.get(`/movie/${movieId}`, config);

			return response.data;
		} catch (error) {
			this.handleTmdbError(error);
		}
	}

	async getMovieCredits(movieId: number) {
		const config = this.getRequestConfig();

		try {
			const response = await tmdbApi.get(`/movie/${movieId}/credits`, config);

			return response.data;
		} catch (error) {
			this.handleTmdbError(error);
		}
	}
}

export default new TmdbService();
