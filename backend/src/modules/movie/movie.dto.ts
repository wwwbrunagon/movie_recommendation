import type {
	MovieIdInput,
	SearchMoviesInput,
} from '../../validators/movie.validator';

export type SearchMoviesInputDto = SearchMoviesInput;
export type MovieIdInputDto = MovieIdInput;

export interface MovieSummaryDto {
	id: number;
	title: string;
	overview: string;
	releaseDate: string | null;
	posterPath: string | null;
	backdropPath: string | null;
	voteAverage: number;
	voteCount: number;
	popularity: number;
	originalLanguage: string;
	genreIds: number[];
	adult: boolean;
}

export interface MovieSearchResponseDto {
	page: number;
	totalPages: number;
	totalResults: number;
	results: MovieSummaryDto[];
}

export interface MovieGenreDto {
	id: number;
	name: string;
}

export interface MovieDetailsDto {
	id: number;
	title: string;
	overview: string;
	releaseDate: string | null;
	runtime: number | null;
	posterPath: string | null;
	backdropPath: string | null;
	voteAverage: number;
	voteCount: number;
	popularity: number;
	originalLanguage: string;
	status: string;
	tagline: string | null;
	genres: MovieGenreDto[];
	adult: boolean;
}

export interface MovieCastMemberDto {
	id: number;
	name: string;
	character: string;
	profilePath: string | null;
	order: number;
}

export interface MovieCrewMemberDto {
	id: number;
	name: string;
	job: string;
	department: string;
	profilePath: string | null;
}

export interface MovieCreditsDto {
	id: number;
	cast: MovieCastMemberDto[];
	crew: MovieCrewMemberDto[];
}
