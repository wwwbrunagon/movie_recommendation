import axios, {
	type AxiosError,
	type InternalAxiosRequestConfig,
} from 'axios';

import {
	clearAuthSession,
	getAccessToken,
	setAuthSession,
} from '../../features/auth/store/auth.helpers';
import type { AuthResponse } from '../../features/auth/types/auth.types';

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
	baseURL,
	withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

function isAuthEndpoint(url?: string) {
	return Boolean(url?.startsWith('/auth/'));
}

async function refreshAccessToken() {
	if (!refreshPromise) {
		refreshPromise = axios
			.post<AuthResponse>(`${baseURL}/auth/refresh`, undefined, {
				withCredentials: true,
			})
			.then((response) => {
				setAuthSession(response.data.accessToken, response.data.user);

				return response.data.accessToken;
			})
			.finally(() => {
				refreshPromise = null;
			});
	}

	return refreshPromise;
}

api.interceptors.request.use((config) => {
	const token = getAccessToken();

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

api.interceptors.response.use(
	(response) => response,

	async (error: AxiosError) => {
		const originalRequest = error.config as RetriableRequestConfig | undefined;

		if (
			error.response?.status !== 401 ||
			!originalRequest ||
			originalRequest._retry ||
			isAuthEndpoint(originalRequest.url)
		) {
			return Promise.reject(error);
		}

		originalRequest._retry = true;

		try {
			const accessToken = await refreshAccessToken();

			originalRequest.headers.Authorization = `Bearer ${accessToken}`;

			return api(originalRequest);
		} catch {
			clearAuthSession();

			return Promise.reject(error);
		}
	},
);
