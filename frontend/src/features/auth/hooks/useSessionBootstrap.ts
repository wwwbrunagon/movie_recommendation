import { useEffect } from 'react';
import { isAxiosError } from 'axios';

import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

export function useSessionBootstrap() {
	const clearSession = useAuthStore((state) => state.clearSession);
	const setBootstrapping = useAuthStore((state) => state.setBootstrapping);
	const setSession = useAuthStore((state) => state.setSession);

	useEffect(() => {
		let isMounted = true;

		window.localStorage?.removeItem?.('auth-storage');

		async function bootstrapSession() {
			try {
				const response = await authService.refresh();

				if (isMounted) {
					setSession(response.accessToken, response.user);
				}
			} catch (error) {
				if (
					isAxiosError(error) &&
					error.response?.status === 401 &&
					error.response.data &&
					typeof error.response.data === 'object' &&
					'code' in error.response.data &&
					error.response.data.code === 'REFRESH_TOKEN_NOT_PROVIDED'
				) {
					console.info(
						'[auth] Session bootstrap skipped: refresh cookie not available for localhost session',
					);
				}

				if (isMounted) {
					clearSession();
				}
			} finally {
				if (isMounted) {
					setBootstrapping(false);
				}
			}
		}

		bootstrapSession();

		return () => {
			isMounted = false;
		};
	}, [clearSession, setBootstrapping, setSession]);
}
