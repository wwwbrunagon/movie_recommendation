import { Route, Routes } from 'react-router-dom';

import userEvent from '@testing-library/user-event';

import { useRegister } from '../../hooks/useRegister';
import { useAuthStore } from '../../store/auth.store';
import type { AuthResponse } from '../../types/auth.types';

import { RegisterPage } from './RegisterPage';
import { render, screen, waitFor } from '../../../../test/test-utils';

vi.mock('../../hooks/useRegister', () => ({
	useRegister: vi.fn(),
}));

const user: AuthResponse['user'] = {
	id: 'user-1',
	name: 'Grace Hopper',
	email: 'grace@example.com',
};

function mockUseRegister(
	overrides: Partial<ReturnType<typeof useRegister>> = {},
) {
	const mutateAsync = vi.fn();

	vi.mocked(useRegister).mockReturnValue({
		mutateAsync,
		isPending: false,
		...overrides,
	} as ReturnType<typeof useRegister>);

	return { mutateAsync };
}

function renderRegisterPage() {
	return render(
		<Routes>
			<Route path="/register" element={<RegisterPage />} />
			<Route path="/" element={<h1>Home route</h1>} />
		</Routes>,
		{ route: '/register' },
	);
}

describe('RegisterPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({
			accessToken: null,
			user: null,
			isBootstrapping: false,
		});
	});

	it('renders the registration form fields', () => {
		mockUseRegister();

		renderRegisterPage();

		expect(
			screen.getByRole('heading', { name: /register/i }),
		).toBeInTheDocument();
		expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /create account/i }))
			.toBeEnabled();
	});

	it('shows a validation message when password confirmation does not match', async () => {
		const { mutateAsync } = mockUseRegister();
		const viewer = userEvent.setup();

		renderRegisterPage();

		await viewer.type(screen.getByLabelText(/name/i), 'Grace Hopper');
		await viewer.type(screen.getByLabelText(/^email$/i), 'grace@example.com');
		await viewer.type(screen.getByLabelText(/^password$/i), 'secret123');
		await viewer.type(screen.getByLabelText(/confirm password/i), 'different');
		await viewer.click(screen.getByRole('button', { name: /create account/i }));

		expect(await screen.findByText(/passwords do not match/i))
			.toBeInTheDocument();
		expect(mutateAsync).not.toHaveBeenCalled();
	});

	it('submits the account data, stores the session, and navigates home', async () => {
		const { mutateAsync } = mockUseRegister();
		mutateAsync.mockResolvedValue({
			accessToken: 'access-token',
			user,
		});
		const viewer = userEvent.setup();

		renderRegisterPage();

		await viewer.type(screen.getByLabelText(/name/i), ' Grace Hopper ');
		await viewer.type(screen.getByLabelText(/^email$/i), 'GRACE@EXAMPLE.COM');
		await viewer.type(screen.getByLabelText(/^password$/i), 'secret123');
		await viewer.type(screen.getByLabelText(/confirm password/i), 'secret123');
		await viewer.click(screen.getByRole('button', { name: /create account/i }));

		await waitFor(() => {
			expect(mutateAsync).toHaveBeenCalledWith({
				name: 'Grace Hopper',
				email: 'grace@example.com',
				password: 'secret123',
			});
		});

		expect(await screen.findByRole('heading', { name: /home route/i }))
			.toBeInTheDocument();
		expect(useAuthStore.getState().accessToken).toBe('access-token');
		expect(useAuthStore.getState().user).toEqual(user);
	});
});
