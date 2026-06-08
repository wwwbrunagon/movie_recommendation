import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { generateToken } from '../utils/jwt';
import { AUTH_ERRORS } from '../constants/auth-errors';

export class AuthService {
  private userRepository = new UserRepository();

  async register(
    name: string,
    email: string,
    password: string
  ) {
    const userExists =
      await this.userRepository.findByEmail(email);

    if (userExists) {
      throw new Error(
        AUTH_ERRORS.USER_ALREADY_EXISTS
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await this.userRepository.create(
        name,
        email,
        hashedPassword
      );

    const token = generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async login(
    email: string,
    password: string
  ) {
    const user =
      await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error(
        AUTH_ERRORS.INVALID_CREDENTIALS
      );
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      throw new Error(
        AUTH_ERRORS.INVALID_CREDENTIALS
      );
    }

    const token = generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}