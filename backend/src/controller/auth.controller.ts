import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  async register(
    req: Request,
    res: Response
  ) {
    try {
      const { name, email, password } = req.body;

      const result =
        await authService.register(
          name,
          email,
          password
        );

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Registration failed",
      });
    }
  }

  async login(
    req: Request,
    res: Response
  ) {
    try {
      const { email, password } = req.body;

      const result =
        await authService.login(
          email,
          password
        );

      return res.json(result);
    } catch (error) {
      return res.status(401).json({
        message:
          error instanceof Error
            ? error.message
            : "Login failed",
      });
    }
  }
}