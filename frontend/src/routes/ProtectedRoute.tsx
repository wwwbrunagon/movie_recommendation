import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../features/auth/hooks/useAuth';
import { ROUTES } from '../shared/constants/routes';


export function ProtectedRoute() {
	const { accessToken, isBootstrapping } = useAuth();

	if (isBootstrapping) {
		return null;
	}

	if (!accessToken) {
		return <Navigate to={ROUTES.LOGIN} replace />;
	}

	return <Outlet />;
}
