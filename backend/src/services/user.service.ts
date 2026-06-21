import type { UserProfileDto } from '../modules/user/user.dto';
import { toUserProfileDto } from '../modules/user/user.mapper';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/app-error';

export class UserService {
	private userRepository = new UserRepository();

	async getProfile(userId: string): Promise<UserProfileDto> {
		const user = await this.userRepository.findProfileById(userId);

		if (!user) {
			throw AppError.notFound('User not found', 'USER_NOT_FOUND');
		}

		return toUserProfileDto(user);
	}
}

//decide a lógica
