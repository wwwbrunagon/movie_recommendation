import { Link } from 'react-router-dom';

import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/auth.store';

export function HomePage() {
	const { user } = useAuth();
	const logout = useAuthStore((state) => state.logout);

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<section className="w-full max-w-xl space-y-4 rounded-lg border p-6">
				<h1 className="text-2xl font-bold">Home</h1>

				<p className="text-sm text-gray-600">
					Voce esta autenticado{user?.name ? ` como ${user.name}` : ''}.
				</p>

				<div className="space-y-1 text-sm">
					<p>
						<span className="font-medium">Nome:</span> {user?.name ?? '-'}
					</p>

					<p>
						<span className="font-medium">Email:</span> {user?.email ?? '-'}
					</p>
				</div>

				<div className="flex gap-3">
					<button
						type="button"
						onClick={logout}
						className="rounded bg-black px-4 py-2 text-white"
					>
						Sair
					</button>

					<Link
						to={ROUTES.LOGIN}
						className="rounded border px-4 py-2 text-sm font-medium"
					>
						Voltar para login
					</Link>
				</div>
			</section>
		</div>
	);
}
