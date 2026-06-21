export interface TmdbMovieSearchResult {
	id: number;
	title: string;
	overview: string;
	release_date?: string;
	poster_path?: string | null;
	backdrop_path?: string | null;
	vote_average: number;
	vote_count: number;
	popularity: number;
	original_language: string;
	genre_ids?: number[];
	adult: boolean;
}

export interface TmdbMovieSearchResponse {
	page: number;
	total_pages: number;
	total_results: number;
	results: TmdbMovieSearchResult[];
}

export interface TmdbMovieGenre {
	id: number;
	name: string;
}

export interface TmdbMovieDetailsResponse {
	id: number;
	title: string;
	overview: string;
	release_date?: string;
	runtime?: number | null;
	poster_path?: string | null;
	backdrop_path?: string | null;
	vote_average: number;
	vote_count: number;
	popularity: number;
	original_language: string;
	status: string;
	tagline?: string | null;
	genres?: TmdbMovieGenre[];
	adult: boolean;
}

export interface TmdbMovieCastMember {
	id: number;
	name: string;
	character: string;
	profile_path?: string | null;
	order: number;
}

export interface TmdbMovieCrewMember {
	id: number;
	name: string;
	job: string;
	department: string;
	profile_path?: string | null;
}

export interface TmdbMovieCreditsResponse {
	id: number;
	cast: TmdbMovieCastMember[];
	crew: TmdbMovieCrewMember[];
}
