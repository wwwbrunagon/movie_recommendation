import { AppRouter } from './routes/AppRouter';

import { QueryProvider } from './shared/providers/QueryProvider';

export function App() {
	return (
		<QueryProvider>
			<AppRouter />
		</QueryProvider>
	);
}
