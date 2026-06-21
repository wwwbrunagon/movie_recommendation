import type {
	AuthenticatedUserDto,
	AuthSessionResponseDto,
	AuthSessionResultDto,
} from './auth.dto';

interface AuthenticatedUserSource {
	id: string;
	name: string;
	email: string;
}

export function toAuthenticatedUserDto(
	user: AuthenticatedUserSource,
): AuthenticatedUserDto {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
	};
}

export function toAuthSessionResponseDto(
	session: AuthSessionResultDto,
): AuthSessionResponseDto {
	return {
		accessToken: session.accessToken,
		user: session.user,
	};
}
