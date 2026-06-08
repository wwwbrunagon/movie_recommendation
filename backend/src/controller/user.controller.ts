import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export class UserController {
	async me(req: Request, res: Response) {
		try {
			const userId = req.user?.userId;

			if (!userId) {
				return res.status(401).json({
					message: 'Unauthorized',
				});
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
				return res.status(404).json({
					message: 'User not found',
				});
			}

			return res.status(200).json(user);
		} catch {
			return res.status(500).json({
				message: 'Internal server error',
			});
		}
	}
}
