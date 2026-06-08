import { Router } from 'express';

import movieController from '../controller/movie.controller';

import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

import {
	searchMoviesSchema,
	movieIdSchema,
} from '../validators/movie.validator';

const router = Router();

router.use(authMiddleware);

router.get(
	'/search',
	validate(searchMoviesSchema, 'query'),
	movieController.searchMovies,
);

router.get(
	'/:id',
	validate(movieIdSchema, 'params'),
	movieController.getMovieDetails,
);

router.get(
	'/:id/credits',
	validate(movieIdSchema, 'params'),
	movieController.getMovieCredits,
);

export default router;
