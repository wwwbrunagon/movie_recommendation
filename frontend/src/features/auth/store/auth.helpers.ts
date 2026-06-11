import { useAuthStore } from "./auth.store";
import type { User } from "../types/user.types";

export const getAccessToken = () =>
  useAuthStore.getState().accessToken;

export const setAuthSession = (
  accessToken: string,
  user: User,
) =>
  useAuthStore.getState().setSession(
    accessToken,
    user,
  );

export const clearAuthSession = () =>
  useAuthStore.getState().clearSession();
