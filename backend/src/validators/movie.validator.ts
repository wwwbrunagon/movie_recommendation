import { z } from 'zod';

export const searchMoviesSchema = z.object({
	query: z.string().min(1, 'Search query is required').max(100),
});

export const movieIdSchema = z.object({
	id: z.coerce.number().int().positive('Movie id must be greater than zero'),
});

export type SearchMoviesInput = z.infer<typeof searchMoviesSchema>;
export type MovieIdInput = z.infer<typeof movieIdSchema>;
