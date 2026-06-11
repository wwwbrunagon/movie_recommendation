import { create } from 'zustand';

import type { User } from '../types/user.types';

interface AuthStore {
	accessToken: string | null;
	user: User | null;
	isBootstrapping: boolean;

	setSession: (accessToken: string, user: User) => void;
	clearSession: () => void;
	setBootstrapping: (isBootstrapping: boolean) => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
	accessToken: null,
	user: null,
	isBootstrapping: true,

	setSession: (accessToken, user) =>
		set({
			accessToken,
			user,
		}),

	clearSession: () =>
		set({
			accessToken: null,
			user: null,
		}),

	setBootstrapping: (isBootstrapping) =>
		set({
			isBootstrapping,
		}),
}));
