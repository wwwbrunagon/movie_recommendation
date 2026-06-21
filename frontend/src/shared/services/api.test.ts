import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const requestUse = vi.fn();
const responseUse = vi.fn();
const refreshPost = vi.fn();
const clearAuthSession = vi.fn();
const getAccessToken = vi.fn();
const setAuthSession = vi.fn();

const apiInstance = Object.assign(vi.fn(), {
	interceptors: {
		request: { use: requestUse },
		response: { use: responseUse },
	},
});

vi.mock('axios', () => ({
	default: {
		create: vi.fn(() => apiInstance),
		post: refreshPost,
	},
}));

vi.mock('../../features/auth/store/auth.helpers', () => ({
	clearAuthSession,
	getAccessToken,
	setAuthSession,
}));

describe('api auth interceptor', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
		import.meta.env.VITE_API_URL = 'http://localhost:3000';
	});

	it('clears the auth session when a protected request gets 401 and refresh fails', async () => {
		refreshPost.mockRejectedValue({
			response: {
				status: 401,
				data: {
					code: 'REFRESH_TOKEN_NOT_PROVIDED',
				},
			},
		});

		await import('./api');

		const rejectedHandler = responseUse.mock.calls[0]?.[1] as (
			error: AxiosError,
		) => Promise<unknown>;

		const error = {
			response: {
				status: 401,
			},
			config: {
				url: '/movies/search',
				headers: {},
			} as InternalAxiosRequestConfig & { _retry?: boolean },
		} as AxiosError;

		await expect(rejectedHandler(error)).rejects.toBe(error);
		expect(refreshPost).toHaveBeenCalledWith(
			'http://localhost:3000/auth/refresh',
			undefined,
			expect.objectContaining({
				withCredentials: true,
			}),
		);
		expect(clearAuthSession).toHaveBeenCalledTimes(1);
	});
});
