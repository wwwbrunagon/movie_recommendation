import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository";
import { generateToken } from "../utils/jwt";

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
      throw new Error("User already exists");
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
      user,
      token,
    };
  }

  async login(
    email: string,
    password: string
  ) {
    const user =
      await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken(user.id);

    return {
      user,
      token,
    };
  }
}

//Toda regra de negócio da autenticação.