import { useQuery } from '@tanstack/react-query';

import { movieService } from '../services/movie.service';

export function useMovieDetails(movieId: number | null) {
	return useQuery({
		queryKey: ['movies', 'details', movieId],
		queryFn: () => movieService.getMovieDetails(movieId as number),
		enabled: movieId !== null,
	});
}
