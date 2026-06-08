import { AppRouter } from './routes/AppRouter';

import { QueryProvider } from './providers/QueryProvider';

export function App() {
	return (
		<QueryProvider>
			<AppRouter />
		</QueryProvider>
	);
}
