import type { User } from './user.types';

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
}

export interface AuthResponse {
	accessToken: string;
	user: User;
}
