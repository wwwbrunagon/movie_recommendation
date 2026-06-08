import axios from "axios";

const tmdbApi = axios.create({
  baseURL: process.env.TMDB_BASE_URL,
  params: {
    api_key: process.env.TMDB_API_KEY,
    language: "en-US",
  },
});

class TmdbService {
  async searchMovies(query: string) {
    const response = await tmdbApi.get("/search/movie", {
      params: { query },
    });

    return response.data;
  }

  async getMovieDetails(movieId: number) {
    const response = await tmdbApi.get(`/movie/${movieId}`);

    return response.data;
  }

  async getMovieCredits(movieId: number) {
    const response = await tmdbApi.get(`/movie/${movieId}/credits`);

    return response.data;
  }
}

export default new TmdbService();