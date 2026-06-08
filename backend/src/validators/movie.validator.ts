import { z } from 'zod';

export const searchMoviesSchema = z.object({
	query: z.string().min(1, 'Search query is required').max(100),
});

export const movieIdSchema = z.object({
	id: z.string().regex(/^\d+$/, 'Movie id must be numeric'),
});
