import { useQuery } from '@tanstack/react-query';

import { movieService } from '../services/movie.service';

export function useMovieSearch(query: string) {
	return useQuery({
		queryKey: ['movies', 'search', query],
		queryFn: () => movieService.searchMovies(query),
		enabled: query.trim().length > 0,
	});
}
