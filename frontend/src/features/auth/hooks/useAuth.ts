import { useAuthStore } from "../store/auth.store";

export const useAuth = () => {
  const store = useAuthStore();

  return {
    ...store,
    isAuthenticated:
      !!store.accessToken,
  };
};
