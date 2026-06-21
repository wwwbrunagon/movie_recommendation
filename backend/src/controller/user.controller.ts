import { Request, Response } from 'express';

import type { UserProfileDto } from '../modules/user/user.dto';
import { UserService } from '../services/user.service';
import { AppError } from '../utils/app-error';

const userService = new UserService();

export class UserController {
	async me(req: Request, res: Response): Promise<Response> {
		const userId = req.user?.userId;

		if (!userId) {
			throw AppError.unauthorized();
		}

		const user: UserProfileDto = await userService.getProfile(userId);

		return res.status(200).json(user);
	}
}

//Controller recebe HTTP
