import { Request, Response } from 'express';
import type {
	MovieIdInputDto,
	SearchMoviesInputDto,
} from '../modules/movie/movie.dto';
import tmdbService from '../services/tmdb.service';

class MovieController {
	async searchMovies(req: Request, res: Response): Promise<Response> {
		const input = req.query as SearchMoviesInputDto;
		const movies = await tmdbService.searchMovies(input);

		return res.status(200).json(movies);
	}

	async getMovieDetails(req: Request, res: Response): Promise<Response> {
		const input = req.params as unknown as MovieIdInputDto;
		const movie = await tmdbService.getMovieDetails(input);

		return res.status(200).json(movie);
	}

	async getMovieCredits(req: Request, res: Response): Promise<Response> {
		const input = req.params as unknown as MovieIdInputDto;
		const credits = await tmdbService.getMovieCredits(input);

		return res.status(200).json(credits);
	}
}

export default new MovieController();
