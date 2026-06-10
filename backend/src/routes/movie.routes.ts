import { Router } from 'express';

import movieController from '../controller/movie.controller';

import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/async-handler';

import {
	searchMoviesSchema,
	movieIdSchema,
} from '../validators/movie.validator';

const router = Router();

router.use(authMiddleware);

router.get(
	'/search',
	validate(searchMoviesSchema, 'query'),
	asyncHandler(movieController.searchMovies),
);

router.get(
	'/:id',
	validate(movieIdSchema, 'params'),
	asyncHandler(movieController.getMovieDetails),
);

router.get(
	'/:id/credits',
	validate(movieIdSchema, 'params'),
	asyncHandler(movieController.getMovieCredits),
);

export default router;
