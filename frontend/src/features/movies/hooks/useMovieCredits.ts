import { useQuery } from '@tanstack/react-query';

import { movieService } from '../services/movie.service';

export function useMovieCredits(movieId: number | null) {
	return useQuery({
		queryKey: ['movies', 'credits', movieId],
		queryFn: () => movieService.getMovieCredits(movieId as number),
		enabled: movieId !== null,
	});
}
