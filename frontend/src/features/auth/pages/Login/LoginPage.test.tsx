import { Route, Routes } from 'react-router-dom';

import userEvent from '@testing-library/user-event';

import { AUTH_MESSAGES } from '../../constants/authMessages';
import { useLogin } from '../../hooks/useLogin';
import { useAuthStore } from '../../store/auth.store';
import type { AuthResponse } from '../../types/auth.types';

import { LoginPage } from './LoginPage';
import { render, screen, waitFor } from '../../../../test/test-utils';

vi.mock('../../hooks/useLogin', () => ({
	useLogin: vi.fn(),
}));

const user: AuthResponse['user'] = {
	id: 'user-1',
	name: 'Ada Lovelace',
	email: 'ada@example.com',
};

function mockUseLogin(
	overrides: Partial<ReturnType<typeof useLogin>> = {},
) {
	const mutateAsync = vi.fn();

	vi.mocked(useLogin).mockReturnValue({
		mutateAsync,
		isPending: false,
		...overrides,
	} as ReturnType<typeof useLogin>);

	return { mutateAsync };
}

function renderLoginPage() {
	return render(
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/" element={<h1>Home route</h1>} />
		</Routes>,
		{ route: '/login' },
	);
}

describe('LoginPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({
			accessToken: null,
			user: null,
			isBootstrapping: false,
		});
	});

	it('renders the login form fields', () => {
		mockUseLogin();

		renderLoginPage();

		expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /login/i })).toBeEnabled();
	});

	it('does not submit invalid form data', async () => {
		const { mutateAsync } = mockUseLogin();
		const viewer = userEvent.setup();

		renderLoginPage();

		await viewer.click(screen.getByRole('button', { name: /login/i }));

		await waitFor(() => {
			expect(screen.getByLabelText(/email/i)).toHaveAttribute(
				'aria-invalid',
				'true',
			);
		});

		expect(mutateAsync).not.toHaveBeenCalled();
	});

	it('submits credentials, stores the session, and navigates home', async () => {
		const { mutateAsync } = mockUseLogin();
		mutateAsync.mockResolvedValue({
			accessToken: 'access-token',
			user,
		});
		const viewer = userEvent.setup();

		renderLoginPage();

		await viewer.type(screen.getByLabelText(/email/i), 'ADA@EXAMPLE.COM');
		await viewer.type(screen.getByLabelText(/password/i), 'secret123');
		await viewer.click(screen.getByRole('button', { name: /login/i }));

		await waitFor(() => {
			expect(mutateAsync).toHaveBeenCalledWith({
				email: 'ada@example.com',
				password: 'secret123',
			});
		});

		expect(await screen.findByRole('heading', { name: /home route/i }))
			.toBeInTheDocument();
		expect(useAuthStore.getState().accessToken).toBe('access-token');
		expect(useAuthStore.getState().user).toEqual(user);
	});

	it('shows a server error when login fails', async () => {
		const { mutateAsync } = mockUseLogin();
		mutateAsync.mockRejectedValue(new Error('Network unavailable'));
		const viewer = userEvent.setup();

		renderLoginPage();

		await viewer.type(screen.getByLabelText(/email/i), 'ada@example.com');
		await viewer.type(screen.getByLabelText(/password/i), 'secret123');
		await viewer.click(screen.getByRole('button', { name: /login/i }));

		expect(await screen.findByRole('alert')).toHaveTextContent(
			AUTH_MESSAGES.LOGIN_UNAVAILABLE,
		);
	});
});
