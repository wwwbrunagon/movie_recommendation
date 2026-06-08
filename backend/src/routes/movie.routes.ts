import { Router } from 'express';
import movieController from '../controller/movie.controller';

const router = Router();

router.get('/search', movieController.searchMovies);

router.get('/:id', movieController.getMovieDetails);

router.get('/:id/credits', movieController.getMovieCredits);

export default router;
