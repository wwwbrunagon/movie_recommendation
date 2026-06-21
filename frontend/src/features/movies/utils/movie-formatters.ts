const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const FALLBACK_POSTER = 'https://placehold.co/500x750?text=Sem+imagem';

export function getMoviePosterUrl(path: string | null) {
	return path ? `${IMAGE_BASE_URL}${path}` : FALLBACK_POSTER;
}

export function getReleaseYear(date: string | null) {
	return date ? date.slice(0, 4) : 'N/A';
}
