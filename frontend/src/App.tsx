import { AppRouter } from './routes/AppRouter';

import { useSessionBootstrap } from './features/auth/hooks/useSessionBootstrap';
import { QueryProvider } from './shared/providers/QueryProvider';

export function App() {
	useSessionBootstrap();

	return (
		<QueryProvider>
			<AppRouter />
		</QueryProvider>
	);
}
