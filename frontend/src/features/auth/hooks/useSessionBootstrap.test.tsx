import { Routes, Route } from 'react-router-dom';

import { render, screen, waitFor } from '../../../test/test-utils';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';
import { useSessionBootstrap } from './useSessionBootstrap';

vi.mock('../services/auth.service', () => ({
	authService: {
		refresh: vi.fn(),
	},
}));

function SessionBootstrapHarness() {
	useSessionBootstrap();
	const { accessToken, isBootstrapping } = useAuthStore();

	return (
		<div>
			<p>bootstrapping:{String(isBootstrapping)}</p>
			<p>token:{accessToken ?? 'none'}</p>
		</div>
	);
}

describe('useSessionBootstrap', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({
			accessToken: null,
			user: null,
			isBootstrapping: true,
		});
		window.history.replaceState({}, '', '/');
	});

	it('restores the session when refresh succeeds', async () => {
		vi.mocked(authService.refresh).mockResolvedValue({
			accessToken: 'access-token',
			user: {
				id: 'user-1',
				name: 'Ada',
				email: 'ada@example.com',
			},
		});

		render(
			<Routes>
				<Route path="/" element={<SessionBootstrapHarness />} />
			</Routes>,
			{ route: '/' },
		);

		await waitFor(() => {
			expect(screen.getByText('bootstrapping:false')).toBeInTheDocument();
		});

		expect(screen.getByText('token:access-token')).toBeInTheDocument();
	});

	it('clears the session when refresh cookie is missing after reload', async () => {
		vi.mocked(authService.refresh).mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 401,
				data: {
					code: 'REFRESH_TOKEN_NOT_PROVIDED',
				},
			},
		});

		render(
			<Routes>
				<Route path="/" element={<SessionBootstrapHarness />} />
			</Routes>,
			{ route: '/' },
		);

		await waitFor(() => {
			expect(screen.getByText('bootstrapping:false')).toBeInTheDocument();
		});

		expect(screen.getByText('token:none')).toBeInTheDocument();
	});
});
