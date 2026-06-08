import { Request, Response } from 'express';
import tmdbService from '../services/tmdb.service';
import { MOVIE_ERRORS } from '../constants/movie-errors';

class MovieController {
  async searchMovies(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { query } = req.query;

      if (!query) {
        throw new Error(
          MOVIE_ERRORS.QUERY_REQUIRED
        );
      }

      const movies =
        await tmdbService.searchMovies(
          String(query)
        );

      return res.status(200).json(movies);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          MOVIE_ERRORS.QUERY_REQUIRED
      ) {
        return res.status(400).json({
          message: 'Query parameter is required',
        });
      }

      console.error(
        'Search movies error:',
        error
      );

      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  }

  async getMovieDetails(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const movieId = Number(req.params.id);

      if (Number.isNaN(movieId)) {
        throw new Error(
          MOVIE_ERRORS.INVALID_MOVIE_ID
        );
      }

      const movie =
        await tmdbService.getMovieDetails(
          movieId
        );

      return res.status(200).json(movie);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          MOVIE_ERRORS.INVALID_MOVIE_ID
      ) {
        return res.status(400).json({
          message: 'Invalid movie id',
        });
      }

      console.error(
        'Get movie details error:',
        error
      );

      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  }

  async getMovieCredits(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const movieId = Number(req.params.id);

      if (Number.isNaN(movieId)) {
        throw new Error(
          MOVIE_ERRORS.INVALID_MOVIE_ID
        );
      }

      const credits =
        await tmdbService.getMovieCredits(
          movieId
        );

      return res.status(200).json(credits);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          MOVIE_ERRORS.INVALID_MOVIE_ID
      ) {
        return res.status(400).json({
          message: 'Invalid movie id',
        });
      }

      console.error(
        'Get movie credits error:',
        error
      );

      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  }
}

export default new MovieController();