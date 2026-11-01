"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@/lib/api";
import { getStoredUser, setStoredUser, setToken, removeToken, getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Demo accounts (work without any backend) ──────────────────
const DEMO_ACCOUNTS: Record<string, { password: string; user: User }> = {
  "demo@eventverse.ai": {
    password: "Demo@1234",
    user: {
      id: "demo-user-001",
      email: "demo@eventverse.ai",
      full_name: "Demo User",
      role: "event_owner",
      avatar_url: undefined,
      created_at: new Date().toISOString(),
    },
  },
  "admin@eventverse.ai": {
    password: "Admin@1234",
    user: {
      id: "admin-user-001",
      email: "admin@eventverse.ai",
      full_name: "Admin User",
      role: "admin",
      avatar_url: undefined,
      created_at: new Date().toISOString(),
    },
  },
};

const MOCK_TOKEN = "demo-token-offline";

function mockLogin(email: string, password: string): User {
  const account = DEMO_ACCOUNTS[email.toLowerCase().trim()];
  if (account && account.password === password) return account.user;
  throw new Error("Invalid email or password");
}

// ── Try real backend, fall back to mock on ANY failure ────────
async function tryBackendLogin(
  email: string,
  password: string
): Promise<{ token: string; user: User } | null> {
  try {
    const { authApi } = await import("@/lib/api");
    const res = await authApi.login({ email, password });
    return { token: res.access_token, user: res.user };
  } catch {
    return null; // backend unavailable or not configured — use mock
  }
}

async function tryBackendRegister(
  email: string,
  password: string,
  fullName: string
): Promise<{ token: string; user: User } | null> {
  try {
    const { authApi } = await import("@/lib/api");
    const res = await authApi.register({ email, password, full_name: fullName }) as { access_token: string; user: User };
    return { token: res.access_token, user: res.user };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    // If using demo token, keep stored user — no backend call needed
    const token = getToken();
    if (token === MOCK_TOKEN) return;
    try {
      const { authApi } = await import("@/lib/api");
      const me = await authApi.getMe();
      setUser(me);
      setStoredUser(me);
    } catch {
      // backend down — keep stored user if exists, else clear
      const stored = getStoredUser();
      if (!stored) { removeToken(); setUser(null); }
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const stored = getStoredUser();
      if (stored) {
        setUser(stored);
        setIsLoading(false);
        if (token !== MOCK_TOKEN) {
          refreshUser().finally(() => setIsLoading(false));
        }
      } else {
        refreshUser().finally(() => setIsLoading(false));
      }
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    // 1. Try real backend
    const backendResult = await tryBackendLogin(email, password);
    if (backendResult) {
      setToken(backendResult.token);
      setUser(backendResult.user);
      setStoredUser(backendResult.user);
      router.push("/dashboard");
      return;
    }

    // 2. Fall back to mock (works offline / no backend)
    const mockUser = mockLogin(email, password); // throws on wrong credentials
    setToken(MOCK_TOKEN);
    setUser(mockUser);
    setStoredUser(mockUser);
    router.push("/dashboard");
  };

  const register = async (email: string, password: string, fullName: string) => {
    // 1. Try real backend
    const backendResult = await tryBackendRegister(email, password, fullName);
    if (backendResult) {
      setToken(backendResult.token);
      setUser(backendResult.user);
      setStoredUser(backendResult.user);
      router.push("/dashboard");
      return;
    }

    // 2. Offline mock — create a local session with provided details
    const mockUser: User = {
      id: `local-${Date.now()}`,
      email,
      full_name: fullName,
      role: "event_owner",
      avatar_url: undefined,
      created_at: new Date().toISOString(),
    };
    setToken(MOCK_TOKEN);
    setUser(mockUser);
    setStoredUser(mockUser);
    router.push("/dashboard");
  };

  const logout = () => {
    removeToken();
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
