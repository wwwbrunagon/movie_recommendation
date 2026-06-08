import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { USER_ERRORS } from '../constants/user-errors';

export class UserController {
	async me(req: Request, res: Response): Promise<Response> {
		try {
			const userId = req.user?.userId;

			if (!userId) {
				throw new Error(USER_ERRORS.UNAUTHORIZED);
			}

			const user = await prisma.user.findUnique({
				where: {
					id: userId,
				},
				select: {
					id: true,
					name: true,
					email: true,
					createdAt: true,
				},
			});

			if (!user) {
				throw new Error(USER_ERRORS.USER_NOT_FOUND);
			}

			return res.status(200).json(user);
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === USER_ERRORS.UNAUTHORIZED
			) {
				return res.status(401).json({
					message: 'Unauthorized',
				});
			}

			if (
				error instanceof Error &&
				error.message === USER_ERRORS.USER_NOT_FOUND
			) {
				return res.status(404).json({
					message: 'User not found',
				});
			}

			console.error('Get authenticated user error:', error);

			return res.status(500).json({
				message: 'Internal server error',
			});
		}
	}
}
