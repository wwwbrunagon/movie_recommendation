import { useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ROUTES } from '../../constants/routes';
import { AUTH_MESSAGES } from '../../constants/authMessages';
import { useRegister } from '../../hooks/useRegister';
import { registerSchema } from '../../schemas/auth.schema';
import type { RegisterFormData } from '../../schemas/auth.schema';
import { useAuthStore } from '../../store/auth.store';

interface ApiErrorResponse {
	message?: string;
}

export function RegisterPage() {
	const navigate = useNavigate();
	const nameInputId = useId();
	const emailInputId = useId();
	const passwordInputId = useId();
	const confirmPasswordInputId = useId();

	const loginStore = useAuthStore((state) => state.login);

	const { mutateAsync, isPending } = useRegister();

	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	function getRegisterErrorMessage(error: unknown) {
		if (axios.isAxiosError<ApiErrorResponse>(error)) {
			if (typeof error.response?.data?.message === 'string') {
				return error.response.data.message;
			}

			if (error.response?.status === 409) {
				return AUTH_MESSAGES.USER_ALREADY_EXISTS;
			}

			if (error.response?.status === 400) {
				return AUTH_MESSAGES.INVALID_FORM_DATA;
			}
		}

		return AUTH_MESSAGES.REGISTER_UNAVAILABLE;
	}

	async function onSubmit(data: RegisterFormData) {
		if (isPending) {
			return;
		}

		clearErrors('root');

		try {
			const response = await mutateAsync({
				name: data.name.trim(),
				email: data.email.trim().toLowerCase(),
				password: data.password,
			});

			loginStore(response.token, response.user);

			navigate(ROUTES.HOME, { replace: true });
		} catch (error) {
			setError('root', {
				type: 'server',
				message: getRegisterErrorMessage(error),
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
				<h1 className="text-2xl font-bold">Register</h1>

				<div>
					<label htmlFor={nameInputId} className="mb-1 block text-sm font-medium">
						Name
					</label>

					<input
						id={nameInputId}
						type="text"
						placeholder="Name"
						autoComplete="name"
						aria-invalid={Boolean(errors.name)}
						aria-describedby={errors.name ? `${nameInputId}-error` : undefined}
						{...register('name', {
							onChange: () => clearErrors('root'),
						})}
						className="w-full rounded border p-2"
					/>

					{errors.name && (
						<p id={`${nameInputId}-error`} className="text-sm text-red-500">
							{errors.name.message}
						</p>
					)}
				</div>

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
						<p id={`${emailInputId}-error`} className="text-sm text-red-500">
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
						autoComplete="new-password"
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
						<p id={`${passwordInputId}-error`} className="text-sm text-red-500">
							{errors.password.message}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor={confirmPasswordInputId}
						className="mb-1 block text-sm font-medium"
					>
						Confirm password
					</label>

					<input
						id={confirmPasswordInputId}
						type="password"
						placeholder="Confirm password"
						autoComplete="new-password"
						aria-invalid={Boolean(errors.confirmPassword)}
						aria-describedby={
							errors.confirmPassword
								? `${confirmPasswordInputId}-error`
								: undefined
						}
						{...register('confirmPassword', {
							onChange: () => clearErrors('root'),
						})}
						className="w-full rounded border p-2"
					/>

					{errors.confirmPassword && (
						<p
							id={`${confirmPasswordInputId}-error`}
							className="text-sm text-red-500"
						>
							{errors.confirmPassword.message}
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
					{isPending ? 'Loading...' : 'Create account'}
				</button>

				<p className="text-sm text-gray-600">
					Ja tem conta?{' '}
					<Link to={ROUTES.LOGIN} className="font-medium text-black underline">
						Entrar
					</Link>
				</p>
			</form>
		</div>
	);
}
