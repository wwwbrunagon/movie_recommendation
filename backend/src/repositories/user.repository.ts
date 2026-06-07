import { prisma } from '../config/prisma';

export class UserRepository {
	async findByEmail(email: string) {
		return prisma.user.findUnique({
			where: { email },
		});
	}

	async create(name: string, email: string, password: string) {
		return prisma.user.create({
			data: {
				name,
				email,
				password,
			},
		});
	}
}

//Falar exclusivamente com o banco.
