const TOKEN_KEY = "say_home_token";
const USER_KEY = "say_home_user";

export const storage = {
  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  removeToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  setUser(user: unknown) {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getUser<T>() {
    if (typeof window !== "undefined") {
      const rawUser = localStorage.getItem(USER_KEY);
      return rawUser ? (JSON.parse(rawUser) as T) : null;
    }
    return null;
  },

  clearAuth() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
};