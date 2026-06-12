import { Route, Routes } from 'react-router-dom';

import { useAuthStore } from '../features/auth/store/auth.store';
import { render, screen } from '../test/test-utils';

import { ProtectedRoute } from './ProtectedRoute';

function renderProtectedRoute() {
	return render(
		<Routes>
			<Route element={<ProtectedRoute />}>
				<Route path="/" element={<h1>Private route</h1>} />
			</Route>

			<Route path="/login" element={<h1>Login route</h1>} />
		</Routes>,
	);
}

describe('ProtectedRoute', () => {
	beforeEach(() => {
		useAuthStore.setState({
			accessToken: null,
			user: null,
			isBootstrapping: false,
		});
	});

	it('redirects unauthenticated users to login', async () => {
		renderProtectedRoute();

		expect(await screen.findByRole('heading', { name: /login route/i }))
			.toBeInTheDocument();
	});

	it('renders the protected route when the user has a session', () => {
		useAuthStore.setState({
			accessToken: 'access-token',
			user: {
				id: 'user-1',
				name: 'Ada Lovelace',
				email: 'ada@example.com',
			},
			isBootstrapping: false,
		});

		renderProtectedRoute();

		expect(screen.getByRole('heading', { name: /private route/i }))
			.toBeInTheDocument();
	});
});
