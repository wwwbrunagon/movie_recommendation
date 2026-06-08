import { Navigate, Outlet } from 'react-router-dom';

import { ROUTES } from '../constants/routes';

import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
	const { token } = useAuth();

	if (!token) {
		return <Navigate to={ROUTES.LOGIN} replace />;
	}

	return <Outlet />;
}
