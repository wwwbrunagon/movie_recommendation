import { api } from '../../../shared/services/api';

import type {
	LoginRequest,
	RegisterRequest,
	AuthResponse,
} from '../types/auth.types';

export const authService = {
	async login(data: LoginRequest): Promise<AuthResponse> {
		const response = await api.post('/auth/login', data);

		return response.data;
	},

	async register(data: RegisterRequest): Promise<AuthResponse> {
		const response = await api.post('/auth/register', data);

		return response.data;
	},

	async refresh(): Promise<AuthResponse> {
		const response = await api.post('/auth/refresh');

		return response.data;
	},

	async logout(): Promise<void> {
		await api.post('/auth/logout');
	},
};
