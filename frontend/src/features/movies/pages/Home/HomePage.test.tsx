import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';

import { render, screen } from '../../../../test/test-utils';
import { useAuthStore } from '../../../auth/store/auth.store';
import { HomePage } from './HomePage';
import { useMovieSearch } from '../../hooks/useMovieSearch';
import { useMovieDetails } from '../../hooks/useMovieDetails';
import { useMovieCredits } from '../../hooks/useMovieCredits';
import { useLogout } from '../../../auth/hooks/useLogout';

vi.mock('../../hooks/useMovieSearch', () => ({
	useMovieSearch: vi.fn(),
}));

vi.mock('../../hooks/useMovieDetails', () => ({
	useMovieDetails: vi.fn(),
}));

vi.mock('../../hooks/useMovieCredits', () => ({
	useMovieCredits: vi.fn(),
}));

vi.mock('../../../auth/hooks/useLogout', () => ({
	useLogout: vi.fn(),
}));

function renderHomePage() {
	return render(
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/login" element={<h1>Login</h1>} />
		</Routes>,
		{ route: '/' },
	);
}

describe('HomePage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({
			accessToken: 'access-token',
			user: {
				id: 'user-1',
				name: 'Ada',
				email: 'ada@example.com',
			},
			isBootstrapping: false,
		});
		vi.mocked(useLogout as unknown as (...args: never[]) => unknown).mockReturnValue(
			{
				mutateAsync: vi.fn(),
				isPending: false,
			} as unknown as ReturnType<typeof useLogout>,
		);
		vi.mocked(useMovieSearch).mockReturnValue({
			data: {
				page: 1,
				totalPages: 1,
				totalResults: 1,
				results: [
					{
						id: 1,
						title: 'Batman Begins',
						overview: 'Bruce Wayne becomes Batman.',
						releaseDate: '2005-06-15',
						posterPath: '/batman.jpg',
						backdropPath: '/batman-bg.jpg',
						voteAverage: 8.2,
						voteCount: 100,
						popularity: 10,
						originalLanguage: 'en',
						genreIds: [28],
						adult: false,
					},
				],
			},
			isFetching: false,
			error: null,
		} as ReturnType<typeof useMovieSearch>);
		vi.mocked(useMovieDetails).mockReturnValue({
			data: {
				id: 1,
				title: 'Batman Begins',
				overview: 'Bruce Wayne becomes Batman.',
				releaseDate: '2005-06-15',
				runtime: 140,
				posterPath: '/batman.jpg',
				backdropPath: '/batman-bg.jpg',
				voteAverage: 8.2,
				voteCount: 100,
				popularity: 10,
				originalLanguage: 'en',
				status: 'Released',
				tagline: 'Fear can hold you prisoner.',
				genres: [{ id: 28, name: 'Action' }],
				adult: false,
			},
			isFetching: false,
			error: null,
		} as ReturnType<typeof useMovieDetails>);
		vi.mocked(useMovieCredits).mockReturnValue({
			data: {
				id: 1,
				cast: [
					{
						id: 10,
						name: 'Christian Bale',
						character: 'Bruce Wayne',
						profilePath: '/bale.jpg',
						order: 0,
					},
				],
			},
			isFetching: false,
			error: null,
		} as ReturnType<typeof useMovieCredits>);
	});

	it('renders movie search and details using the normalized camelCase contract', async () => {
		const viewer = userEvent.setup();

		renderHomePage();

		await viewer.click(screen.getByRole('button', { name: /batman begins/i }));

		expect(screen.getByText('1 encontrados')).toBeInTheDocument();
		expect(screen.getAllByText('Batman Begins')).toHaveLength(2);
		expect(screen.getAllByText(/2005 · Nota 8\.2/i).length).toBeGreaterThan(0);
		expect(screen.getByText('Christian Bale')).toBeInTheDocument();
		expect(
			screen.getAllByRole('img', { name: 'Batman Begins' }),
		).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					src: expect.stringContaining('/batman.jpg'),
				}),
			]),
		);
	});
});
