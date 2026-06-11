import { useEffect } from 'react';

import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

export function useSessionBootstrap() {
	const clearSession = useAuthStore((state) => state.clearSession);
	const setBootstrapping = useAuthStore((state) => state.setBootstrapping);
	const setSession = useAuthStore((state) => state.setSession);

	useEffect(() => {
		let isMounted = true;

		localStorage.removeItem('auth-storage');

		async function bootstrapSession() {
			try {
				const response = await authService.refresh();

				if (isMounted) {
					setSession(response.accessToken, response.user);
				}
			} catch {
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
