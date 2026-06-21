export {};

declare global {
  namespace Express {
    interface ValidatedRequestData {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    }

    interface Request {
      user?: {
        userId: string;
      };
      validated?: ValidatedRequestData;
    }
  }
}
