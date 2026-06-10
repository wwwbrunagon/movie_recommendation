import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/app-error';

export class UserController {
	async me(req: Request, res: Response): Promise<Response> {
		const userId = req.user?.userId;

		if (!userId) {
			throw AppError.unauthorized();
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
			throw AppError.notFound('User not found', 'USER_NOT_FOUND');
		}

		return res.status(200).json(user);
	}
}
