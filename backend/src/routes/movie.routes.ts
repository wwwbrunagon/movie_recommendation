import { Router } from 'express';
import movieController from '../controller/movie.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/search', movieController.searchMovies);

router.get('/:id', movieController.getMovieDetails);

router.get('/:id/credits', movieController.getMovieCredits);

export default router;
