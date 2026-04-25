const TOKEN_KEY = "alira_session_token";

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};
