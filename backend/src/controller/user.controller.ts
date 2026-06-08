import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export class UserController {
	async me(req: Request, res: Response) {
		const userId = req.user?.userId;
        
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				id: true,
				name: true,
				email: true,
			},
		});

		return res.json(user);
	}
}
