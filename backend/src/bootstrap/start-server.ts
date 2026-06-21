import type { Express } from 'express';
import type { Server } from 'http';

import { getAppConfig } from '../config/app-config';

export function startServer(app: Express): Server {
	const { port } = getAppConfig();

	return app.listen(port, () => {
		console.log(`Server running on port ${port}`);
	});
}
