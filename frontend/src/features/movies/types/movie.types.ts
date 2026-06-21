export interface MovieSearchItem {
	id: number;
	title: string;
	overview: string;
	posterPath: string | null;
	backdropPath: string | null;
	releaseDate: string | null;
	voteAverage: number;
	voteCount: number;
	popularity: number;
	originalLanguage: string;
	genreIds: number[];
	adult: boolean;
}

export interface MovieSearchResponse {
	page: number;
	results: MovieSearchItem[];
	totalPages: number;
	totalResults: number;
}

export interface MovieGenre {
	id: number;
	name: string;
}

export interface MovieDetails {
	id: number;
	title: string;
	overview: string;
	posterPath: string | null;
	backdropPath: string | null;
	releaseDate: string | null;
	runtime: number | null;
	voteAverage: number;
	voteCount: number;
	popularity: number;
	originalLanguage: string;
	status: string;
	tagline: string | null;
	genres: MovieGenre[];
	adult: boolean;
}

export interface MovieCastMember {
	id: number;
	name: string;
	character: string;
	profilePath: string | null;
	order: number;
}

export interface MovieCreditsResponse {
	id: number;
	cast: MovieCastMember[];
}
