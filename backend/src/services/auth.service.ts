import bcrypt from 'bcrypt';

import { UserRepository } from '../repositories/user.repository';
import { RefreshSessionRepository } from '../repositories/refresh-session.repository';
import { generateAccessToken } from '../utils/jwt';
import { AUTH_MESSAGES } from '../constants/auth-messages';
import { AppError } from '../utils/app-error';
import {
	generateRefreshToken,
	getRefreshTokenExpiresAt,
	hashRefreshToken,
} from '../utils/refresh-token';

interface SessionUser {
	id: string;
	name: string;
	email: string;
}

interface AuthSessionResult {
	accessToken: string;
	refreshToken: string;
	user: SessionUser;
}

export class AuthService {
	private userRepository = new UserRepository();
	private refreshSessionRepository = new RefreshSessionRepository();

	async register(
		name: string,
		email: string,
		password: string,
	): Promise<AuthSessionResult> {
		const userExists = await this.userRepository.findByEmail(email);

		if (userExists) {
			throw AppError.conflict(
				AUTH_MESSAGES.USER_ALREADY_EXISTS,
				'USER_ALREADY_EXISTS',
			);
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await this.userRepository.create(name, email, hashedPassword);

		return this.createAuthSession({
			id: user.id,
			name: user.name,
			email: user.email,
		});
	}

	async login(email: string, password: string): Promise<AuthSessionResult> {
		const user = await this.userRepository.findByEmail(email);

		if (!user) {
			throw AppError.unauthorized(
				AUTH_MESSAGES.INVALID_CREDENTIALS,
				'INVALID_CREDENTIALS',
			);
		}

		const passwordMatch = await bcrypt.compare(password, user.password);

		if (!passwordMatch) {
			throw AppError.unauthorized(
				AUTH_MESSAGES.INVALID_CREDENTIALS,
				'INVALID_CREDENTIALS',
			);
		}

		return this.createAuthSession({
			id: user.id,
			name: user.name,
			email: user.email,
		});
	}

	async refresh(refreshToken: string): Promise<AuthSessionResult> {
		const tokenHash = hashRefreshToken(refreshToken);
		const session =
			await this.refreshSessionRepository.findValidByTokenHash(tokenHash);

		if (!session) {
			throw AppError.unauthorized('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
		}

		await this.refreshSessionRepository.revoke(session.id);

		return this.createAuthSession({
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
		});
	}

	async logout(refreshToken: string): Promise<void> {
		const tokenHash = hashRefreshToken(refreshToken);
		const session =
			await this.refreshSessionRepository.findValidByTokenHash(tokenHash);

		if (session) {
			await this.refreshSessionRepository.revoke(session.id);
		}
	}

	private async createAuthSession(user: SessionUser): Promise<AuthSessionResult> {
		const refreshToken = generateRefreshToken();
		const tokenHash = hashRefreshToken(refreshToken);
		const expiresAt = getRefreshTokenExpiresAt();

		await this.refreshSessionRepository.create(user.id, tokenHash, expiresAt);

		return {
			accessToken: generateAccessToken(user.id),
			refreshToken,
			user,
		};
	}
}
