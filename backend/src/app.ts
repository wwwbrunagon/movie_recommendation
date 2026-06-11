import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import healthRoutes from './routes/health.routes';
import { authRoutes } from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import movieRoutes from './routes/movie.routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN,
		credentials: true,
	}),
);
app.use(express.json());
app.use(cookieParser());

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/movies', movieRoutes);

// Global error handling middleware (must be last)
app.use(errorMiddleware);

export default app;
