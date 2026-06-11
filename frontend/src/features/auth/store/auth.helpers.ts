import { useAuthStore } from "./auth.store";

export const getAccessToken = () =>
  useAuthStore.getState().token;

export const logout = () =>
  useAuthStore.getState().logout();

//permite acessar o store fora dos componentes React.