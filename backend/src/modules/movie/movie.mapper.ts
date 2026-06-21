import type {
	TmdbMovieCreditsResponse,
	TmdbMovieDetailsResponse,
	TmdbMovieSearchResponse,
	TmdbMovieSearchResult,
} from './movie.external-types';
import type {
	MovieCreditsDto,
	MovieDetailsDto,
	MovieSearchResponseDto,
	MovieSummaryDto,
} from './movie.dto';

export function toMovieSummaryDto(
	movie: TmdbMovieSearchResult,
): MovieSummaryDto {
	return {
		id: movie.id,
		title: movie.title,
		overview: movie.overview,
		releaseDate: movie.release_date ?? null,
		posterPath: movie.poster_path ?? null,
		backdropPath: movie.backdrop_path ?? null,
		voteAverage: movie.vote_average,
		voteCount: movie.vote_count,
		popularity: movie.popularity,
		originalLanguage: movie.original_language,
		genreIds: movie.genre_ids ?? [],
		adult: movie.adult,
	};
}

export function toMovieSearchResponseDto(
	response: TmdbMovieSearchResponse,
): MovieSearchResponseDto {
	return {
		page: response.page,
		totalPages: response.total_pages,
		totalResults: response.total_results,
		results: response.results.map(toMovieSummaryDto),
	};
}

export function toMovieDetailsDto(
	movie: TmdbMovieDetailsResponse,
): MovieDetailsDto {
	return {
		id: movie.id,
		title: movie.title,
		overview: movie.overview,
		releaseDate: movie.release_date ?? null,
		runtime: movie.runtime ?? null,
		posterPath: movie.poster_path ?? null,
		backdropPath: movie.backdrop_path ?? null,
		voteAverage: movie.vote_average,
		voteCount: movie.vote_count,
		popularity: movie.popularity,
		originalLanguage: movie.original_language,
		status: movie.status,
		tagline: movie.tagline ?? null,
		genres: movie.genres ?? [],
		adult: movie.adult,
	};
}

export function toMovieCreditsDto(
	credits: TmdbMovieCreditsResponse,
): MovieCreditsDto {
	return {
		id: credits.id,
		cast: credits.cast.map((member) => ({
			id: member.id,
			name: member.name,
			character: member.character,
			profilePath: member.profile_path ?? null,
			order: member.order,
		})),
		crew: credits.crew.map((member) => ({
			id: member.id,
			name: member.name,
			job: member.job,
			department: member.department,
			profilePath: member.profile_path ?? null,
		})),
	};
}
