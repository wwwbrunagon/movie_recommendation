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

interface ApiErrorPayload {
	code?: string;
	message?: string;
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

function getErrorCode(error: AxiosError<ApiErrorPayload>) {
	return error.response?.data?.code;
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
		const axiosError = error as AxiosError<ApiErrorPayload>;
		const originalRequest = axiosError.config as RetriableRequestConfig | undefined;

		if (
			axiosError.response?.status !== 401 ||
			!originalRequest ||
			originalRequest._retry ||
			isAuthEndpoint(originalRequest.url)
		) {
			return Promise.reject(axiosError);
		}

		originalRequest._retry = true;

		try {
			const accessToken = await refreshAccessToken();

			originalRequest.headers.Authorization = `Bearer ${accessToken}`;

			return api(originalRequest);
		} catch (refreshError) {
			const refreshAxiosError = refreshError as AxiosError<ApiErrorPayload>;
			const refreshErrorCode = getErrorCode(refreshAxiosError);

			if (refreshErrorCode === 'REFRESH_TOKEN_NOT_PROVIDED') {
				console.info(
					'[auth] Refresh skipped: browser did not send a refresh cookie for localhost session',
				);
			}

			clearAuthSession();

			return Promise.reject(axiosError);
		}
	},
);
