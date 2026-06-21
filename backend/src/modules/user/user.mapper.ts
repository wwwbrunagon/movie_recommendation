import type { UserProfileDto } from './user.dto';

interface UserProfileSource {
	id: string;
	name: string;
	email: string;
	createdAt: Date;
}

export function toUserProfileDto(user: UserProfileSource): UserProfileDto {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		createdAt: user.createdAt,
	};
}
