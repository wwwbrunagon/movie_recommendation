import type { ReactElement, ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	render as testingLibraryRender,
	type RenderOptions,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
	route?: string;
	withRouter?: boolean;
}

function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
			mutations: {
				retry: false,
			},
		},
	});
}

function render(
	ui: ReactElement,
	{
		route = '/',
		withRouter = true,
		...renderOptions
	}: CustomRenderOptions = {},
) {
	const queryClient = createTestQueryClient();

	function Wrapper({ children }: { children: ReactNode }) {
		const content = (
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		);

		if (!withRouter) {
			return content;
		}

		return (
			<MemoryRouter initialEntries={[route]}>
				{content}
			</MemoryRouter>
		);
	}

	return testingLibraryRender(ui, {
		wrapper: Wrapper,
		...renderOptions,
	});
}

export * from '@testing-library/react';
export { render };
