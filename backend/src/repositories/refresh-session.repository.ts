import { prisma } from '../config/prisma';

export class RefreshSessionRepository {
	async create(userId: string, tokenHash: string, expiresAt: Date) {
		return prisma.refreshSession.create({
			data: {
				userId,
				tokenHash,
				expiresAt,
			},
		});
	}

	async findValidByTokenHash(tokenHash: string) {
		return prisma.refreshSession.findFirst({
			where: {
				tokenHash,
				revokedAt: null,
				expiresAt: {
					gt: new Date(),
				},
			},
			include: {
				user: true,
			},
		});
	}

	async revoke(id: string) {
		return prisma.refreshSession.update({
			where: { id },
			data: {
				revokedAt: new Date(),
			},
		});
	}
}
