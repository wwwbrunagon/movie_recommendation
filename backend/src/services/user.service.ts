import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/app-error';

export class UserService {
	private userRepository = new UserRepository();

	async getProfile(userId: string) {
		const user = await this.userRepository.findProfileById(userId);

		if (!user) {
			throw AppError.notFound('User not found', 'USER_NOT_FOUND');
		}

		return user;
	}
}

//decide a lógica