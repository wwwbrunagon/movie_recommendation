import { Request, Response } from 'express';
import tmdbService from '../services/tmdb.service';
import { AppError } from '../utils/app-error';

class MovieController {
	async searchMovies(req: Request, res: Response): Promise<Response> {
		const { query } = req.query;

		if (!query) {
			throw AppError.badRequest(
				'Query parameter is required',
				'QUERY_REQUIRED',
			);
		}

		const movies = await tmdbService.searchMovies(String(query));

		return res.status(200).json(movies);
	}

	async getMovieDetails(req: Request, res: Response): Promise<Response> {
		const movieId = Number(req.params.id);

		if (Number.isNaN(movieId)) {
			throw AppError.badRequest('Invalid movie id', 'INVALID_MOVIE_ID');
		}

		const movie = await tmdbService.getMovieDetails(movieId);

		return res.status(200).json(movie);
	}

	async getMovieCredits(req: Request, res: Response): Promise<Response> {
		const movieId = Number(req.params.id);

		if (Number.isNaN(movieId)) {
			throw AppError.badRequest('Invalid movie id', 'INVALID_MOVIE_ID');
		}

		const credits = await tmdbService.getMovieCredits(movieId);

		return res.status(200).json(credits);
	}
}

export default new MovieController();
