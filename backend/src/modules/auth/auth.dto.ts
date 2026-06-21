import type { LoginInput, RegisterInput } from '../../validators/auth.validator';

export type RegisterUserInputDto = RegisterInput;
export type LoginUserInputDto = LoginInput;

export interface AuthenticatedUserDto {
	id: string;
	name: string;
	email: string;
}

export interface AuthSessionResponseDto {
	accessToken: string;
	user: AuthenticatedUserDto;
}

export interface AuthSessionResultDto extends AuthSessionResponseDto {
	refreshToken: string;
}
