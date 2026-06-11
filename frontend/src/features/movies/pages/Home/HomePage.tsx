import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ROUTES } from '../../../../shared/constants/routes';
import { useLogout } from '../../../auth/hooks/useLogout';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useAuthStore } from '../../../auth/store/auth.store';
import { useMovieCredits } from '../../hooks/useMovieCredits';
import { useMovieDetails } from '../../hooks/useMovieDetails';
import { useMovieSearch } from '../../hooks/useMovieSearch';
import { getMoviePosterUrl, getReleaseYear } from '../../utils/movie-formatters';

export function HomePage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const clearSession = useAuthStore((state) => state.clearSession);
	const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
	const [searchInput, setSearchInput] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

	const {
		data: searchResults,
		isFetching: isSearching,
		error: searchError,
	} = useMovieSearch(searchQuery);

	const {
		data: selectedMovie,
		isFetching: isLoadingDetails,
		error: detailsError,
	} = useMovieDetails(selectedMovieId);

	const {
		data: movieCredits,
		isFetching: isLoadingCredits,
		error: creditsError,
	} = useMovieCredits(selectedMovieId);

	const castPreview = useMemo(
		() => movieCredits?.cast.slice(0, 6) ?? [],
		[movieCredits],
	);

	function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const normalizedQuery = searchInput.trim();

		setSearchQuery(normalizedQuery);
		setSelectedMovieId(null);
	}

	async function handleLogout() {
		try {
			await logout();
		} finally {
			clearSession();
			navigate(ROUTES.LOGIN, { replace: true });
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 px-4 py-6">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
				<header className="flex flex-col gap-4 rounded-lg border bg-white p-6 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-1">
						<h1 className="text-2xl font-bold">Movie Explorer</h1>

						<p className="text-sm text-gray-600">
							Bem-vindo{user?.name ? `, ${user.name}` : ''}. Busque filmes e
							veja detalhes completos.
						</p>

						<p className="text-sm text-gray-500">{user?.email ?? '-'}</p>
					</div>

					<div className="flex gap-3">
						<button
							type="button"
							onClick={handleLogout}
							disabled={isLoggingOut}
							className="rounded bg-black px-4 py-2 text-white"
						>
							{isLoggingOut ? 'Saindo...' : 'Sair'}
						</button>

						<Link
							to={ROUTES.LOGIN}
							className="rounded border px-4 py-2 text-sm font-medium"
						>
							Ir para login
						</Link>
					</div>
				</header>

				<form
					onSubmit={handleSearchSubmit}
					className="flex flex-col gap-3 rounded-lg border bg-white p-6 sm:flex-row"
				>
					<input
						type="search"
						value={searchInput}
						onChange={(event) => setSearchInput(event.target.value)}
						placeholder="Buscar por titulo, por exemplo: Batman"
						className="w-full rounded border p-3"
					/>

					<button
						type="submit"
						disabled={!searchInput.trim() || isSearching}
						className="rounded bg-black px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSearching ? 'Buscando...' : 'Buscar'}
					</button>
				</form>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
					<section className="rounded-lg border bg-white p-6">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-lg font-semibold">Resultados</h2>

							{searchResults && (
								<span className="text-sm text-gray-500">
									{searchResults.total_results} encontrados
								</span>
							)}
						</div>

						{searchError && (
							<p className="text-sm text-red-500">
								Nao foi possivel buscar filmes agora.
							</p>
						)}

						{!searchQuery && (
							<p className="text-sm text-gray-500">
								Faça uma busca para listar filmes.
							</p>
						)}

						{searchQuery &&
							!isSearching &&
							!searchError &&
							searchResults?.results.length === 0 && (
								<p className="text-sm text-gray-500">
									Nenhum filme encontrado para essa busca.
								</p>
							)}

						<div className="space-y-3">
							{searchResults?.results.map((movie) => (
								<button
									key={movie.id}
									type="button"
									onClick={() => setSelectedMovieId(movie.id)}
									className={`flex w-full gap-4 rounded-lg border p-3 text-left transition ${
										selectedMovieId === movie.id
											? 'border-black bg-gray-100'
											: 'border-gray-200 hover:border-gray-400'
									}`}
								>
									<img
										src={getMoviePosterUrl(movie.poster_path)}
										alt={movie.title}
										className="h-24 w-16 rounded object-cover"
									/>

									<div className="min-w-0 space-y-2">
										<div>
											<h3 className="font-semibold">{movie.title}</h3>
											<p className="text-sm text-gray-500">
												{getReleaseYear(movie.release_date)} · Nota{' '}
												{movie.vote_average.toFixed(1)}
											</p>
										</div>

										<p className="line-clamp-3 text-sm text-gray-700">
											{movie.overview || 'Sem sinopse disponivel.'}
										</p>
									</div>
								</button>
							))}
						</div>
					</section>

					<aside className="rounded-lg border bg-white p-6">
						<h2 className="mb-4 text-lg font-semibold">Detalhes do filme</h2>

						{!selectedMovieId && (
							<p className="text-sm text-gray-500">
								Selecione um filme para ver detalhes e elenco.
							</p>
						)}

						{(detailsError || creditsError) && (
							<p className="text-sm text-red-500">
								Nao foi possivel carregar os detalhes deste filme.
							</p>
						)}

						{selectedMovieId && (isLoadingDetails || isLoadingCredits) && (
							<p className="text-sm text-gray-500">Carregando detalhes...</p>
						)}

						{selectedMovie && !isLoadingDetails && (
							<div className="space-y-5">
								<img
									src={getMoviePosterUrl(selectedMovie.poster_path)}
									alt={selectedMovie.title}
									className="aspect-[2/3] w-full rounded-lg object-cover"
								/>

								<div className="space-y-3">
									<div>
										<h3 className="text-xl font-bold">{selectedMovie.title}</h3>
										<p className="text-sm text-gray-500">
											{getReleaseYear(selectedMovie.release_date)} ·{' '}
											{selectedMovie.runtime ? `${selectedMovie.runtime} min` : 'Duracao N/A'} ·
											{' '}Nota {selectedMovie.vote_average.toFixed(1)}
										</p>
									</div>

									<div className="flex flex-wrap gap-2">
										{selectedMovie.genres.map((genre) => (
											<span
												key={genre.id}
												className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium"
											>
												{genre.name}
											</span>
										))}
									</div>

									<p className="text-sm leading-6 text-gray-700">
										{selectedMovie.overview || 'Sem sinopse disponivel.'}
									</p>
								</div>

								<div className="space-y-3">
									<h4 className="font-semibold">Elenco principal</h4>

									{castPreview.length === 0 ? (
										<p className="text-sm text-gray-500">
											Elenco indisponivel para este filme.
										</p>
									) : (
										<ul className="space-y-2">
											{castPreview.map((person) => (
												<li
													key={person.id}
													className="rounded border border-gray-200 p-3"
												>
													<p className="font-medium">{person.name}</p>
													<p className="text-sm text-gray-500">
														{person.character || 'Personagem nao informado'}
													</p>
												</li>
											))}
										</ul>
									)}
								</div>
							</div>
						)}
					</aside>
				</div>
			</div>
		</div>
	);
}
