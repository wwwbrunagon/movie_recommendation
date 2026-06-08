import { useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginSchema } from '../../schemas/auth.schema';
import type { LoginFormData } from '../../schemas/auth.schema';
import { useLogin } from '../../hooks/useLogin';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../constants/routes';
import { AUTH_MESSAGES } from '../../constants/authMessages';

interface ApiErrorResponse {
	message?: string;
}

export function LoginPage() {
	const navigate = useNavigate();
	const emailInputId = useId();
	const passwordInputId = useId();

	const loginStore = useAuthStore((state) => state.login);

	const { mutateAsync, isPending } = useLogin();

	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	function getLoginErrorMessage(error: unknown) {
		if (axios.isAxiosError<ApiErrorResponse>(error)) {
			if (typeof error.response?.data?.message === 'string') {
				return error.response.data.message;
			}

			if (error.response?.status === 401) {
				return AUTH_MESSAGES.INVALID_CREDENTIALS;
			}
		}

		return AUTH_MESSAGES.LOGIN_UNAVAILABLE;
	}

	async function onSubmit(data: LoginFormData) {
		if (isPending) {
			return;
		}

		clearErrors('root');

		try {
			const response = await mutateAsync({
				email: data.email.trim().toLowerCase(),
				password: data.password,
			});

			loginStore(response.token, response.user);

			navigate(ROUTES.HOME, { replace: true });
		} catch (error) {
			setError('root', {
				type: 'server',
				message: getLoginErrorMessage(error),
			});
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<form
				noValidate
				onSubmit={handleSubmit(onSubmit)}
				className="w-full max-w-md space-y-4 rounded-lg border p-6"
			>
				<h1 className="text-2xl font-bold">Login</h1>

				<div>
					<label htmlFor={emailInputId} className="mb-1 block text-sm font-medium">
						Email
					</label>

					<input
						id={emailInputId}
						type="email"
						placeholder="Email"
						autoComplete="email"
						inputMode="email"
						aria-invalid={Boolean(errors.email)}
						aria-describedby={errors.email ? `${emailInputId}-error` : undefined}
						{...register('email', {
							onChange: () => clearErrors('root'),
						})}
						className="w-full rounded border p-2"
					/>

					{errors.email && (
						<p
							id={`${emailInputId}-error`}
							className="text-sm text-red-500"
						>
							{errors.email.message}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor={passwordInputId}
						className="mb-1 block text-sm font-medium"
					>
						Password
					</label>

					<input
						id={passwordInputId}
						type="password"
						placeholder="Password"
						autoComplete="current-password"
						aria-invalid={Boolean(errors.password)}
						aria-describedby={
							errors.password ? `${passwordInputId}-error` : undefined
						}
						{...register('password', {
							onChange: () => clearErrors('root'),
						})}
						className="w-full rounded border p-2"
					/>

					{errors.password && (
						<p
							id={`${passwordInputId}-error`}
							className="text-sm text-red-500"
						>
							{errors.password.message}
						</p>
					)}
				</div>

				{errors.root?.message && (
					<p role="alert" className="text-sm text-red-500">
						{errors.root.message}
					</p>
				)}

				<button
					type="submit"
					disabled={isPending}
					aria-busy={isPending}
					className="w-full rounded bg-black p-2 text-white"
				>
					{isPending ? 'Loading...' : 'Login'}
				</button>

				<p className="text-sm text-gray-600">
					Ainda nao tem conta?{' '}
					<Link
						to={ROUTES.REGISTER}
						className="font-medium text-black underline"
					>
						Criar conta
					</Link>
				</p>
			</form>
		</div>
	);
}
