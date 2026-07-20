import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role, TokenResponse, User } from "../types";
import { api, clearToken, getToken, setToken } from "./api";

interface AuthState {
  user: User | null;
  role: Role | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    name: string;
    password: string;
    phone?: string;
  }) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on first load if a token is present.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<User>("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  function applySession(data: TokenResponse): User {
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  }

  async function login(email: string, password: string): Promise<User> {
    const { data } = await api.post<TokenResponse>("/auth/login", { email, password });
    return applySession(data);
  }

  async function register(payload: {
    email: string;
    name: string;
    password: string;
    phone?: string;
  }): Promise<User> {
    const { data } = await api.post<TokenResponse>("/auth/register", payload);
    return applySession(data);
  }

  async function loginWithGoogle(credential: string): Promise<User> {
    const { data } = await api.post<TokenResponse>("/auth/google", { credential });
    return applySession(data);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  const value = useMemo<AuthState>(
    () => ({
      user,
      role: user ? (user.is_admin ? "admin" : "seller") : null,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
