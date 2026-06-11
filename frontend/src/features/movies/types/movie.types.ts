export interface MovieSearchItem {
	id: number;
	title: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	release_date: string;
	vote_average: number;
}

export interface MovieSearchResponse {
	page: number;
	results: MovieSearchItem[];
	total_pages: number;
	total_results: number;
}

export interface MovieGenre {
	id: number;
	name: string;
}

export interface MovieDetails {
	id: number;
	title: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	release_date: string;
	runtime: number | null;
	vote_average: number;
	genres: MovieGenre[];
}

export interface MovieCastMember {
	id: number;
	name: string;
	character: string;
	profile_path: string | null;
}

export interface MovieCreditsResponse {
	id: number;
	cast: MovieCastMember[];
}
