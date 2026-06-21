import axios from 'axios';
import { getAppConfig } from '../config/app-config';
import type {
	MovieCreditsDto,
	MovieDetailsDto,
	MovieIdInputDto,
	MovieSearchResponseDto,
	SearchMoviesInputDto,
} from '../modules/movie/movie.dto';
import {
	toMovieCreditsDto,
	toMovieDetailsDto,
	toMovieSearchResponseDto,
} from '../modules/movie/movie.mapper';
import type {
	TmdbMovieCreditsResponse,
	TmdbMovieDetailsResponse,
	TmdbMovieSearchResponse,
} from '../modules/movie/movie.external-types';
import { AppError } from '../utils/app-error';

const tmdbApi = axios.create();

class TmdbService {
	private getRequestConfig() {
		const { tmdb } = getAppConfig();

		return {
			baseURL: tmdb.baseUrl,
			params: {
				api_key: tmdb.apiKey,
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

	async searchMovies({
		query,
	}: SearchMoviesInputDto): Promise<MovieSearchResponseDto> {
		const config = this.getRequestConfig();

		try {
			const response = await tmdbApi.get<TmdbMovieSearchResponse>(
				'/search/movie',
				{
				...config,
				params: { ...config.params, query },
				},
			);

			return toMovieSearchResponseDto(response.data);
		} catch (error) {
			this.handleTmdbError(error);
		}
	}

	async getMovieDetails({
		id: movieId,
	}: MovieIdInputDto): Promise<MovieDetailsDto> {
		const config = this.getRequestConfig();

		try {
			const response = await tmdbApi.get<TmdbMovieDetailsResponse>(
				`/movie/${movieId}`,
				config,
			);

			return toMovieDetailsDto(response.data);
		} catch (error) {
			this.handleTmdbError(error);
		}
	}

	async getMovieCredits({
		id: movieId,
	}: MovieIdInputDto): Promise<MovieCreditsDto> {
		const config = this.getRequestConfig();

		try {
			const response = await tmdbApi.get<TmdbMovieCreditsResponse>(
				`/movie/${movieId}/credits`,
				config,
			);

			return toMovieCreditsDto(response.data);
		} catch (error) {
			this.handleTmdbError(error);
		}
	}
}

export default new TmdbService();
