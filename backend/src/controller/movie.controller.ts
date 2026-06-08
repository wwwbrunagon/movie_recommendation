import { Request, Response } from "express";
import tmdbService from "../services/tmdb.service";

class MovieController {
  async searchMovies(req: Request, res: Response) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          message: "Query parameter is required",
        });
      }

      const movies = await tmdbService.searchMovies(String(query));

      return res.json(movies);
    } catch (error) {
      return res.status(500).json({
        message: "Error searching movies",
      });
    }
  }

  async getMovieDetails(req: Request, res: Response) {
    try {
      const movieId = Number(req.params.id);

      const movie = await tmdbService.getMovieDetails(movieId);

      return res.json(movie);
    } catch (error) {
      return res.status(500).json({
        message: "Error fetching movie details",
      });
    }
  }

  async getMovieCredits(req: Request, res: Response) {
    try {
      const movieId = Number(req.params.id);

      const credits = await tmdbService.getMovieCredits(movieId);

      return res.json(credits);
    } catch (error) {
      return res.status(500).json({
        message: "Error fetching movie credits",
      });
    }
  }
}

export default new MovieController();

//Responsável por receber a request e devolver a response.